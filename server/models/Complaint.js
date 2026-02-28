const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // E.g., CMP12345
    studentId: { type: String, required: true }, // The ID string from User model
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    gender: { type: String },
    facultyId: { type: String },
    faculty: { type: String },
    schoolId: { type: String },
    school: { type: String },
    course: { type: String },
    desc: { type: String, required: true },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved', 'Reopened'],
        default: 'New'
    },
    referral: { type: String, default: '' },
    remarks: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
