const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        // Both user-specific and role-based notifications
        const query = {
            $or: [
                { userId: req.user.id },
                { role: req.user.role }
            ]
        };

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { read: true });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const query = {
            $or: [{ userId: req.user.id }, { role: req.user.role }]
        };
        await Notification.updateMany(query, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.clearNotifications = async (req, res) => {
    try {
        const query = {
            $or: [{ userId: req.user.id }, { role: req.user.role }]
        };
        await Notification.deleteMany(query);
        res.json({ success: true, message: 'Notifications cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
