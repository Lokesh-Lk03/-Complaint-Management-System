const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    try {
        const { id, name, email, password, role, course, contact, dept } = req.body;

        const userExists = await User.findOne({ id });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User ID already exists' });
        }

        // Set a default password if none is provided
        const plainPwd = password || 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPwd, salt);

        const user = await User.create({
            id, name, email, role,
            password: hashedPassword,
            course, contact, dept
        });

        // Notify admin that account was created
        await Notification.create({
            role: 'admin',
            title: 'New Account',
            message: `${role} account ${name} (${id}) was registered.`,
            icon: role === 'student' ? 'fa-user-graduate' : 'fa-user-shield'
        });

        res.status(201).json({ success: true, data: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create user', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ id });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.status = user.status === 'blocked' ? 'active' : 'blocked';
        await user.save();

        res.json({ success: true, data: { id: user.id, status: user.status } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findOneAndDelete({ id });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
