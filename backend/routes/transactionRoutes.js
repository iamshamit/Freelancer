// backend/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserTransactionHistory,
  getJobTransactionHistory,
  getJobEscrowBalance,
  getTransactionSummaryData,
  getTransactionById
} = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/auth');

// Get user's transaction history
router.get('/', protect, getUserTransactionHistory);

// Get transaction summary (admin only)
router.get('/summary', protect, admin, getTransactionSummaryData);

// Get escrow balance for a job
router.get('/escrow/:jobId', protect, getJobEscrowBalance);

// Get transactions for a specific job
router.get('/job/:jobId', protect, getJobTransactionHistory);

// Get transaction by ID
router.get('/:id', protect, getTransactionById);

module.exports = router;