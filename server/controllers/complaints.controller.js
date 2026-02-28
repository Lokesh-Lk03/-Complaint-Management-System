const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

exports.createComplaint = async (req, res) => {
    try {
        const complaintData = req.body;

        // Auto-generate ID (CMP + 5 random digits)
        complaintData.id = 'CMP' + Math.floor(Math.random() * 90000 + 10000);
        complaintData.studentId = req.user.id;

        const complaint = await Complaint.create(complaintData);

        // Notify admins
        await Notification.create({
            role: 'admin',
            title: 'New Complaint',
            message: `${complaint.name} submitted complaint ${complaint.id}.`,
            icon: 'fa-inbox'
        });

        // Notify student
        await Notification.create({
            userId: req.user.id,
            title: 'Complaint Submitted',
            message: `Your complaint ${complaint.id} has been received.`,
            icon: 'fa-paper-plane'
        });

        res.status(201).json({ success: true, data: complaint });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create complaint', error: error.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        let query = {};

        // If student, only see their own complaints
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        }

        const complaints = await Complaint.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateComplaint = async (req, res) => {
    try {
        const { id } = req.params; // The CMP ID
        const { status, referral, remarks } = req.body;

        const complaint = await Complaint.findOne({ id });
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const oldStatus = complaint.status;

        complaint.status = status;
        complaint.referral = referral || '';
        complaint.remarks = remarks || '';

        await complaint.save();

        // Notify student if status changed
        if (oldStatus !== status) {
            await Notification.create({
                userId: complaint.studentId,
                title: 'Complaint Updated',
                message: `Your complaint ${id} status changed to ${status}.`,
                icon: 'fa-circle-dot'
            });
        }

        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
