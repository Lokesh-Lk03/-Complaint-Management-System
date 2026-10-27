const express = require('express');
const multer = require('multer');
const { createComplaint, getComplaints, updateComplaint } = require('../controllers/complaints.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// File upload configuration with size and format limits
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/quicktime',
            'application/pdf'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images (JPG, PNG, WEBP), videos (MP4), and PDFs are allowed.'));
        }
    }
});

// Middleware wrapper for multer error handling
const handleUpload = (req, res, next) => {
    upload.single('attachment')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 10MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

router.route('/')
    .get(protect, getComplaints)
    .post(protect, authorize('student'), handleUpload, createComplaint);

router.route('/:id')
    .patch(protect, authorize('admin', 'staff', 'faculty', 'student'), updateComplaint);

module.exports = router;
