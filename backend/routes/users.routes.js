const express = require('express');
const { createUser, getUsers, toggleUserStatus, deleteUser } = require('../controllers/users.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Only Admins can manage users
router.use(protect, authorize('admin', 'faculty', 'staff'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id/status')
    .patch(toggleUserStatus);

router.route('/:id')
    .delete(deleteUser);

module.exports = router;
