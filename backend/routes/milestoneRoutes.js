// backend/routes/milestoneRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access jobId
const {
  createMilestones,
  getMilestones,
  requestMilestoneApproval,
  approveMilestone,
  rejectMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/milestoneController');
const { protect, employer, freelancer } = require('../middleware/auth');

// All routes are prefixed with /api/jobs/:jobId/milestones
router.post('/', protect, employer, createMilestones);
router.get('/', protect, getMilestones);
router.post('/:milestoneId/request-approval', protect, freelancer, requestMilestoneApproval);
router.post('/:milestoneId/approve', protect, employer, approveMilestone);
router.post('/:milestoneId/reject', protect, employer, rejectMilestone);
router.put('/:milestoneId', protect, employer, updateMilestone);
router.delete('/:milestoneId', protect, employer, deleteMilestone);

module.exports = router;