// backend/controllers/milestoneController.js
const { Milestone, Job, Escrow, Transaction, Notification, User, Chat } = require('../models');
const { createEscrowRelease } = require('../utils/transactionHelpers');
const { createAndEmitNotification } = require('../utils/notificationHelper');

// @desc    Create milestones for a job
// @route   POST /api/jobs/:jobId/milestones
// @access  Private/Employer
const createMilestones = async (req, res) => {
  try {
    const { milestones } = req.body;
    const jobId = req.params.jobId;

    // Validate job exists and user is employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (job.status !== 'assigned') {
      return res.status(400).json({ message: 'Job must be assigned before creating milestones' });
    }

    // Check if milestones already exist
    const existingMilestones = await Milestone.find({ job: jobId });
    if (existingMilestones.length > 0) {
      return res.status(400).json({ message: 'Milestones already exist for this job' });
    }

    // Validate total percentage equals 100
    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercentage !== 100) {
      return res.status(400).json({ message: 'Total milestone percentage must equal 100%' });
    }

    // Create milestones
    const createdMilestones = [];
    for (let i = 0; i < milestones.length; i++) {
      const milestone = await Milestone.create({
        job: jobId,
        title: milestones[i].title,
        description: milestones[i].description,
        percentage: milestones[i].percentage,
        amount: (job.budget * milestones[i].percentage) / 100,
        dueDate: milestones[i].dueDate,
        order: i + 1,
        status: i === 0 ? 'in_progress' : 'pending' // First milestone starts automatically
      });
      createdMilestones.push(milestone);
    }

    // Update escrow with milestone structure
    const escrow = await Escrow.findOne({ job: jobId });
    if (escrow) {
      escrow.milestones = createdMilestones.map(m => ({
        milestone: m._id,
        percentage: m.percentage,
        amount: m.amount,
        released: false
      }));
      await escrow.save();
    }

    // Create and emit notification for freelancer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: job.freelancer,
      sender: req.user._id,
      type: 'milestones_created',
      title: 'Project Milestones Created',
      message: `Milestones have been created for your project: ${job.title}`,
      job: jobId,
      link: `/jobs/${jobId}/milestones`,
      actions: [
        {
          label: 'View Milestones',
          link: `/jobs/${jobId}/milestones`,
          primary: true
        },
        {
          label: 'View Job',
          link: `/jobs/${jobId}`,
          primary: false
        }
      ],
      metadata: {
        jobTitle: job.title,
        totalMilestones: createdMilestones.length,
        firstMilestone: createdMilestones[0].title,
        employerName: req.user.name
      }
    });

    res.status(201).json(createdMilestones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all milestones for a job
// @route   GET /api/jobs/:jobId/milestones
// @access  Private
const getMilestones = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    const isAuthorized = 
      job.employer.toString() === req.user._id.toString() ||
      job.freelancer?.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const milestones = await Milestone.find({ job: req.params.jobId })
      .sort({ order: 1 });

    res.json(milestones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request milestone approval
// @route   POST /api/jobs/:jobId/milestones/:milestoneId/request-approval
// @access  Private/Freelancer
const requestMilestoneApproval = async (req, res) => {
  try {
    const { jobId, milestoneId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.freelancer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'in_progress') {
      return res.status(400).json({ message: 'Milestone must be in progress to request approval' });
    }

    // Update milestone status
    milestone.status = 'completed';
    milestone.completedAt = Date.now();
    await milestone.save();

    // Create and emit notification for employer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: job.employer,
      sender: req.user._id,
      type: 'milestone_approval_requested',
      title: 'Milestone Approval Requested',
      message: `${req.user.name} has requested approval for milestone: ${milestone.title}`,
      job: jobId,
      link: `/jobs/${jobId}/milestones`,
      actions: [
        {
          label: 'Review Milestone',
          link: `/jobs/${jobId}/milestones/${milestoneId}`,
          primary: true
        },
        {
          label: 'View All Milestones',
          link: `/jobs/${jobId}/milestones`,
          primary: false
        }
      ],
      metadata: {
        milestoneTitle: milestone.title,
        milestonePercentage: milestone.percentage,
        milestoneAmount: milestone.amount,
        freelancerName: req.user.name,
        jobTitle: job.title
      }
    });

    res.json({ message: 'Approval requested successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve milestone and release payment
// @route   POST /api/jobs/:jobId/milestones/:milestoneId/approve
// @access  Private/Employer
const approveMilestone = async (req, res) => {
  try {
    const { jobId, milestoneId } = req.params;
    const { feedback } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'completed') {
      return res.status(400).json({ message: 'Milestone must be completed before approval' });
    }

    // Update milestone
    milestone.status = 'approved';
    milestone.approvedAt = Date.now();
    milestone.feedback = feedback;
    await milestone.save();

    // Update job milestone percentage
    const allMilestones = await Milestone.find({ job: jobId });
    const approvedPercentage = allMilestones
      .filter(m => m.status === 'approved')
      .reduce((sum, m) => sum + m.percentage, 0);
    
    job.milestonePercentage = approvedPercentage;
    job.paymentReleased += milestone.amount;

    // Check if job is completed
    const isJobCompleted = approvedPercentage === 100;
    if (isJobCompleted) {
      job.status = 'completed';
      job.completedAt = Date.now();
      
      // Update freelancer's completed jobs count
      await User.findByIdAndUpdate(job.freelancer, {
        $inc: { completedJobs: 1 }
      });
    }
    
    await job.save();

    // Archive chat
    if (isJobCompleted) {
      console.log("Attempting to archive chat...");
      const chat = await Chat.findOne({ job: jobId });
      if (chat) {
        console.log(`Job ID: ${jobId}, Chat ID: ${chat._id}`);
        console.log(`Before archive - Chat isArchived: ${chat.isArchived}`);
        chat.isArchived = true;
        await chat.save();
        console.log(`After archive - Chat isArchived: ${chat.isArchived}`);
      }
    }

    // Update escrow
    const escrow = await Escrow.findOne({ job: jobId });
    if (escrow) {
      const milestoneIndex = escrow.milestones.findIndex(
        m => m.milestone.toString() === milestoneId
      );
      
      if (milestoneIndex !== -1) {
        escrow.milestones[milestoneIndex].released = true;
        escrow.milestones[milestoneIndex].releasedAt = Date.now();
        escrow.releasedAmount += milestone.amount;
        
        if (isJobCompleted) {
          escrow.status = 'completed';
        }
        
        await escrow.save();
      }
    }

    // Create transaction
    await createEscrowRelease(
      jobId, 
      escrow._id, 
      job.freelancer, 
      milestone.amount, 
      milestone.percentage
    );

    // Activate next milestone if exists
    const nextMilestone = await Milestone.findOne({
      job: jobId,
      order: milestone.order + 1,
      status: 'pending'
    });
    
    if (nextMilestone) {
      nextMilestone.status = 'in_progress';
      await nextMilestone.save();
    }

    // Create and emit notification for freelancer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: job.freelancer,
      sender: req.user._id,
      type: 'milestone_approved',
      title: isJobCompleted ? 'Final Milestone Approved!' : 'Milestone Approved',
      message: `Milestone "${milestone.title}" has been approved and payment of $${milestone.amount.toFixed(2)} has been released.${isJobCompleted ? ' Congratulations on completing the project!' : ''}`,
      job: jobId,
      link: `/jobs/${jobId}`,
      actions: [
        {
          label: isJobCompleted ? 'View Completed Job' : 'Continue Project',
          link: `/jobs/${jobId}`,
          primary: true
        },
        {
          label: 'View Transactions',
          link: `/transactions`,
          primary: false
        }
      ],
      metadata: {
        milestoneTitle: milestone.title,
        milestoneAmount: milestone.amount,
        milestonePercentage: milestone.percentage,
        totalProgress: approvedPercentage,
        isJobCompleted: isJobCompleted,
        feedback: feedback,
        employerName: req.user.name,
        jobTitle: job.title,
        nextMilestone: nextMilestone ? nextMilestone.title : null
      }
    });

    res.json({ 
      message: 'Milestone approved and payment released',
      paymentAmount: milestone.amount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject milestone
// @route   POST /api/jobs/:jobId/milestones/:milestoneId/reject
// @access  Private/Employer
const rejectMilestone = async (req, res) => {
  try {
    const { jobId, milestoneId } = req.params;
    const { reason } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'completed') {
      return res.status(400).json({ message: 'Can only reject completed milestones' });
    }

    // Update milestone
    milestone.status = 'in_progress'; // Back to in progress
    milestone.rejectedAt = Date.now();
    milestone.rejectionReason = reason;
    await milestone.save();

    // Create and emit notification for freelancer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: job.freelancer,
      sender: req.user._id,
      type: 'milestone_rejected',
      title: 'Milestone Needs Revision',
      message: `Milestone "${milestone.title}" requires revision. Please review the feedback and resubmit.`,
      job: jobId,
      link: `/jobs/${jobId}/milestones/${milestoneId}`,
      actions: [
        {
          label: 'View Feedback',
          link: `/jobs/${jobId}/milestones/${milestoneId}`,
          primary: true
        },
        {
          label: 'Contact Employer',
          link: `/chats/job/${jobId}`,
          primary: false
        }
      ],
      metadata: {
        milestoneTitle: milestone.title,
        rejectionReason: reason,
        employerName: req.user.name,
        jobTitle: job.title,
        milestonePercentage: milestone.percentage
      }
    });

    res.json({ message: 'Milestone rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update milestone
// @route   PUT /api/jobs/:jobId/milestones/:milestoneId
// @access  Private/Employer
const updateMilestone = async (req, res) => {
  try {
    const { jobId, milestoneId } = req.params;
    const { title, description, dueDate } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status === 'approved') {
      return res.status(400).json({ message: 'Cannot update approved milestones' });
    }

    // Update fields
    if (title) milestone.title = title;
    if (description) milestone.description = description;
    if (dueDate) milestone.dueDate = dueDate;

    await milestone.save();

    res.json(milestone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete milestone
// @route   DELETE /api/jobs/:jobId/milestones/:milestoneId
// @access  Private/Employer
const deleteMilestone = async (req, res) => {
  try {
    const { jobId, milestoneId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending milestones' });
    }

    // Check if this would leave the job without 100% coverage
    const otherMilestones = await Milestone.find({ 
      job: jobId, 
      _id: { $ne: milestoneId } 
    });
    
    const remainingPercentage = otherMilestones.reduce((sum, m) => sum + m.percentage, 0);
    if (remainingPercentage < 100) {
      return res.status(400).json({ 
        message: 'Cannot delete milestone. Total percentage must equal 100%' 
      });
    }

    await milestone.remove();

    // Update order of remaining milestones
    const remainingMilestones = await Milestone.find({ job: jobId }).sort({ order: 1 });
    for (let i = 0; i < remainingMilestones.length; i++) {
      remainingMilestones[i].order = i + 1;
      await remainingMilestones[i].save();
    }

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMilestones,
  getMilestones,
  requestMilestoneApproval,
  approveMilestone,
  rejectMilestone,
  updateMilestone,
  deleteMilestone
};