// backend/routes/securityRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPrivacySettings,
  updatePrivacySettings,
  getSecuritySettings,
  updateSecuritySettings,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  deleteAccount,
  regenerateBackupCodes,
  getBackupCodesCount,
  viewBackupCodes
} = require('../controllers/securityController');
const { protect } = require('../middleware/auth');

// Privacy settings routes
router.get('/privacy', protect, getPrivacySettings);
router.put('/privacy', protect, updatePrivacySettings);

// Security settings routes
router.get('/settings', protect, getSecuritySettings);
router.put('/settings', protect, updateSecuritySettings);

// Password management
router.put('/password', protect, changePassword);

// Two-Factor Authentication routes
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/backup-codes/regenerate', protect, regenerateBackupCodes);
router.get('/2fa/backup-codes/count', protect, getBackupCodesCount);
router.post('/2fa/backup-codes/view', protect, viewBackupCodes);

// Account deletion
router.delete('/account', protect, deleteAccount);

module.exports = router;