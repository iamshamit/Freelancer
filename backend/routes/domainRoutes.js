// backend/routes/domainRoutes.js
const express = require('express');
const router = express.Router();
const { getDomains, createDomain, updateDomain, getDomainById } = require('../controllers/domainController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getDomains);
router.get('/:id', getDomainById);

// Admin routes
router.post('/', protect, admin, createDomain);
router.put('/:id', protect, admin, updateDomain);

module.exports = router;