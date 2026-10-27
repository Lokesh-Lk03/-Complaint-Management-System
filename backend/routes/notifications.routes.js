const express = require('express');
const { getNotifications, markRead, markAllRead, clearNotifications } = require('../controllers/notifications.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotifications)
    .delete(clearNotifications);

router.post('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
