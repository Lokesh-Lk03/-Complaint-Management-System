const express = require('express');
const { createComplaint, getComplaints, updateComplaint } = require('../controllers/complaints.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.route('/')
    .get(protect, getComplaints)
    .post(protect, authorize('student'), createComplaint);

router.route('/:id')
    .patch(protect, authorize('admin', 'staff'), updateComplaint);

module.exports = router;
