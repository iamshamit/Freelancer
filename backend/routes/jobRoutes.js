// backend/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const milestoneRoutes = require('./milestoneRoutes');
const { getEscrowBalance } = require('../controllers/paymentController');
const {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  selectFreelancer,
  updateMilestone,
  getEmployerJobs,
  getFreelancerJobs,
  rateFreelancer,
  getAppliedJobs,
} = require('../controllers/jobController');
const { protect, employer, freelancer } = require('../middleware/auth');

router.post('/', protect, employer, createJob);
router.get('/', protect, getJobs);
router.get('/employer', protect, employer, getEmployerJobs);
router.get('/freelancer', protect, freelancer, getFreelancerJobs);
router.get('/applied', protect, freelancer, getAppliedJobs);
router.get('/:id', protect, getJobById);
router.post('/:id/apply', protect, freelancer, applyForJob);
router.put('/:id/select/:freelancerId', protect, employer, selectFreelancer);
router.post('/:id/rate', protect, employer, rateFreelancer);

// Milestone routes
router.use('/:jobId/milestones', milestoneRoutes);

// Escrow route
router.get('/:jobId/escrow', protect, getEscrowBalance);

module.exports = router;