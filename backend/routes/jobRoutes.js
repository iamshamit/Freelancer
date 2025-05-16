// backend/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  selectFreelancer,
  updateMilestone,
  getEmployerJobs,
  getFreelancerJobs,
  rateFreelancer
} = require('../controllers/jobController');
const { protect, employer, freelancer } = require('../middleware/auth');

router.post('/', protect, employer, createJob);
router.get('/', protect, getJobs);
router.get('/employer', protect, employer, getEmployerJobs);
router.get('/freelancer', protect, freelancer, getFreelancerJobs);
router.get('/:id', protect, getJobById);
router.post('/:id/apply', protect, freelancer, applyForJob);
router.put('/:id/select/:freelancerId', protect, employer, selectFreelancer);
router.put('/:id/milestone', protect, employer, updateMilestone);
router.post('/:id/rate', protect, employer, rateFreelancer);

module.exports = router;