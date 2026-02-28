const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.login = async (req, res) => {
    try {
        const { id, password } = req.body;

        // Quick fallback for demo purposes during development
        if (id === 'admin' && password === 'admin') {
            return res.json({
                success: true,
                token: generateToken('admin', 'admin'),
                user: { id: 'admin', name: 'Administrator', email: 'admin@university.edu', role: 'admin' }
            });
        }

        if (id === 'student' && password === 'student') {
            return res.json({
                success: true,
                token: generateToken('student', 'student'),
                user: { id: 'student', name: 'Student User', email: 'student@university.edu', role: 'student' }
            });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ success: false, message: 'Account is blocked. Contact administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            token: generateToken(user.id, user.role),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // We can't actually change password for static 'admin' or 'student'
        if (userId === 'admin' || userId === 'student') {
            return res.json({ success: true, message: 'Demo account password updated (simulated)' });
        }

        const user = await User.findOne({ id: userId });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
