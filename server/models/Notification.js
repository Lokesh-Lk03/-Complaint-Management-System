const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String }, // Targeted user ID
    role: { type: String },   // Or targeted role (e.g. 'admin')
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'fa-bell' },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
