const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getJobs,
  removeJob,
  getAdminActivity,
  getSystemHealth
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Apply admin protection to all routes
router.use(protect);
router.use(admin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Job management
router.get('/jobs', getJobs);
router.delete('/jobs/:id', removeJob);

// Admin activity logs
router.get('/activity', getAdminActivity);

// System health
router.get('/system', getSystemHealth);

module.exports = router;