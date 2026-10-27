const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { mockUsers, mockNotifications } = require('../config/mockStore');

exports.createUser = async (req, res) => {
    try {
        const { id, name, email, password, role, course, contact, dept } = req.body;

        if (!id || !name || !email) {
            return res.status(400).json({ success: false, message: 'ID, name, and email are required.' });
        }

        const trimmedId = id.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const userRole = (role || 'student').toLowerCase();

        // 1. Supabase configured
        if (supabase) {
            const { data: userExists } = await supabase
                .from('users')
                .select('id')
                .eq('id', trimmedId)
                .maybeSingle();

            if (userExists) {
                return res.status(400).json({ success: false, message: 'User ID already exists' });
            }

            const plainPwd = password || 'password123';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPwd, salt);

            const { data: user, error } = await supabase
                .from('users')
                .insert([{
                    id: trimmedId,
                    name: name.trim(),
                    email: trimmedEmail,
                    role: userRole,
                    password: hashedPassword,
                    course: course || null,
                    contact: contact || null,
                    dept: dept || null,
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;

            try {
                await supabase.from('notifications').insert([{
                    role: 'admin',
                    title: 'New Account Registered',
                    message: `${userRole.toUpperCase()} account ${name} (${trimmedId}) was created.`,
                    icon: userRole === 'student' ? 'fa-user-graduate' : 'fa-user-shield'
                }]);
            } catch (e) {
                console.warn('User notif error:', e.message);
            }

            return res.status(201).json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    course: user.course,
                    dept: user.dept,
                    contact: user.contact,
                    status: user.status
                }
            });
        }

        // 2. Local mock fallback
        if (mockUsers.find(u => u.id.toLowerCase() === trimmedId.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'User ID already exists' });
        }

        if (mockUsers.find(u => u.email.toLowerCase() === trimmedEmail)) {
            return res.status(400).json({ success: false, message: 'Email address is already in use.' });
        }

        const plainPwd = password || 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPwd, salt);

        const newUser = {
            id: trimmedId,
            name: name.trim(),
            email: trimmedEmail,
            role: userRole,
            password: hashedPassword,
            course: course || '',
            contact: contact || '',
            dept: dept || '',
            status: 'active',
            created_at: new Date().toISOString()
        };

        mockUsers.push(newUser);

        mockNotifications.unshift({
            id: 'notif-' + Date.now(),
            userId: null,
            role: 'admin',
            title: 'New Account Registered',
            message: `${userRole.toUpperCase()} account ${name} (${trimmedId}) was created.`,
            icon: userRole === 'student' ? 'fa-user-graduate' : 'fa-user-shield',
            read: false,
            created_at: new Date().toISOString()
        });

        return res.status(201).json({
            success: true,
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                course: newUser.course,
                dept: newUser.dept,
                contact: newUser.contact,
                status: newUser.status
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(400).json({ success: false, message: 'Failed to create user', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const roleFilter = req.query.role;

        // 1. Supabase configured
        if (supabase) {
            let query = supabase
                .from('users')
                .select('id, name, email, role, course, contact, dept, status, created_at')
                .order('created_at', { ascending: false });

            if (roleFilter) {
                query = query.eq('role', roleFilter.toLowerCase());
            }

            const { data: users, error } = await query;
            if (error) throw error;
            return res.json({ success: true, data: users || [] });
        }

        // 2. Local mock fallback
        let users = mockUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            course: u.course,
            contact: u.contact,
            dept: u.dept,
            status: u.status,
            created_at: u.created_at
        }));

        if (roleFilter) {
            users = users.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
        }

        users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return res.json({ success: true, data: users });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot deactivate the primary system administrator account.' });
        }

        // 1. Supabase configured
        if (supabase) {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('id, status')
                .eq('id', id)
                .single();

            if (fetchError || !user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const newStatus = user.status === 'blocked' ? 'active' : 'blocked';

            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({ status: newStatus })
                .eq('id', id)
                .select('id, status')
                .single();

            if (updateError) throw updateError;
            return res.json({ success: true, data: updatedUser });
        }

        // 2. Local mock fallback
        const user = mockUsers.find(u => u.id === id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.status = user.status === 'blocked' ? 'active' : 'blocked';
        return res.json({ success: true, data: { id: user.id, status: user.status } });

    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete the primary system administrator.' });
        }

        // 1. Supabase configured
        if (supabase) {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.json({ success: true, message: 'User deleted successfully' });
        }

        // 2. Local mock fallback
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        mockUsers.splice(index, 1);
        return res.json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
