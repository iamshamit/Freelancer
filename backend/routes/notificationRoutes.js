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

// IMPORTANT: Specific routes MUST come before parameterized routes

// Basic notification routes
router.get('/', protect, getUserNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.get('/category-counts', protect, getCategoryCounts);

// Preferences routes (MUST come before /:id routes)
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

// Mark as read routes (specific routes first)
router.put('/read-all', protect, markAllAsRead);
router.put('/mark-read-multiple', protect, markMultipleAsRead);

// Bulk operations (specific routes)
router.delete('/multiple', protect, deleteMultipleNotifications);
router.put('/archive-multiple', protect, archiveMultipleNotifications);

// Test notification (specific route)
router.post('/test', protect, sendTestNotification);

// Parameterized routes MUST come LAST
router.put('/:id', protect, markAsRead);

module.exports = router;