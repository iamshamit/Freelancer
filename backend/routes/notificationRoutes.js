// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getCategoryCounts,
  markMultipleAsRead,
  deleteMultipleNotifications,
  archiveMultipleNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');


router.get('/', protect, getUserNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.get('/category-counts', protect, getCategoryCounts);


router.put('/read-all', protect, markAllAsRead);
router.put('/mark-read-multiple', protect, markMultipleAsRead);

router.delete('/multiple', protect, deleteMultipleNotifications);
router.put('/archive-multiple', protect, archiveMultipleNotifications);


router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

router.post('/test', protect, sendTestNotification);

router.put('/:id', protect, markAsRead);

module.exports = router;