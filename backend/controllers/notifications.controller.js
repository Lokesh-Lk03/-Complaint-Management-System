const supabase = require('../config/supabase');
const { mockNotifications } = require('../config/mockStore');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Supabase configured
        if (supabase) {
            let query = supabase.from('notifications').select('*');

            if (userRole === 'admin') {
                // Admin sees administrative notifications or notifications addressed to them
                query = query.or(`role.eq.admin,role.eq.staff,userId.eq.${userId}`);
            } else if (userRole === 'staff' || userRole === 'faculty') {
                // Department staff/faculty see staff & admin announcements or personal notifications
                query = query.or(`role.eq.staff,role.eq.admin,userId.eq.${userId}`);
            } else {
                // Students ONLY see notifications specifically addressed to their own userId
                query = query.eq('userId', userId);
            }

            const { data: notifications, error } = await query
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return res.json({ success: true, data: notifications || [] });
        }

        // 2. Local mock fallback
        const filtered = mockNotifications.filter(n => {
            if (userRole === 'admin') {
                return (n.role === 'admin' || n.role === 'staff' || n.userId === userId);
            }
            if (userRole === 'staff' || userRole === 'faculty') {
                return (n.role === 'staff' || n.role === 'admin' || n.userId === userId);
            }
            // Student ONLY sees their own notifications
            return n.userId === userId;
        });

        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return res.json({ success: true, data: filtered });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (supabase) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;
            return res.json({ success: true, message: 'Notification marked as read' });
        }

        const notif = mockNotifications.find(n => String(n.id) === String(id));
        if (notif) {
            notif.read = true;
        }

        return res.json({ success: true, message: 'Notification marked as read' });

    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        if (supabase) {
            let query = supabase.from('notifications').update({ read: true });

            if (userRole === 'admin') {
                query = query.or(`role.eq.admin,role.eq.staff,userId.eq.${userId}`);
            } else if (userRole === 'staff' || userRole === 'faculty') {
                query = query.or(`role.eq.staff,role.eq.admin,userId.eq.${userId}`);
            } else {
                query = query.eq('userId', userId);
            }

            const { error } = await query;
            if (error) throw error;
            return res.json({ success: true, message: 'All notifications marked as read' });
        }

        mockNotifications.forEach(n => {
            if (userRole === 'admin') {
                if (n.role === 'admin' || n.role === 'staff' || n.userId === userId) n.read = true;
            } else if (userRole === 'staff' || userRole === 'faculty') {
                if (n.role === 'staff' || n.role === 'admin' || n.userId === userId) n.read = true;
            } else {
                if (n.userId === userId) n.read = true;
            }
        });

        return res.json({ success: true, message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.clearNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        if (supabase) {
            let query = supabase.from('notifications').delete();

            if (userRole === 'admin') {
                query = query.or(`role.eq.admin,role.eq.staff,userId.eq.${userId}`);
            } else if (userRole === 'staff' || userRole === 'faculty') {
                query = query.or(`role.eq.staff,role.eq.admin,userId.eq.${userId}`);
            } else {
                query = query.eq('userId', userId);
            }

            const { error } = await query;
            if (error) throw error;
            return res.json({ success: true, message: 'Notifications cleared' });
        }

        for (let i = mockNotifications.length - 1; i >= 0; i--) {
            const n = mockNotifications[i];
            let shouldDelete = false;
            if (userRole === 'admin') {
                shouldDelete = (n.role === 'admin' || n.role === 'staff' || n.userId === userId);
            } else if (userRole === 'staff' || userRole === 'faculty') {
                shouldDelete = (n.role === 'staff' || n.role === 'admin' || n.userId === userId);
            } else {
                shouldDelete = (n.userId === userId);
            }
            if (shouldDelete) {
                mockNotifications.splice(i, 1);
            }
        }

        return res.json({ success: true, message: 'Notifications cleared' });

    } catch (error) {
        console.error('Clear notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
