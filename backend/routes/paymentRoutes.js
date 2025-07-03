// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPaymentHistory,
  getPaymentReceipt,
  exportPaymentHistory,
  getEscrowBalance
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/history', protect, getPaymentHistory);
router.get('/export', protect, exportPaymentHistory);
router.get('/:paymentId/receipt', protect, getPaymentReceipt);

module.exports = router;