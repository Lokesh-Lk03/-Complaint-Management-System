const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // custom ID like student ID or username
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ['student', 'admin', 'staff'], required: true },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    course: { type: String }, // For students
    contact: { type: String },
    dept: { type: String }, // For staff
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
