// backend/controllers/jobController.js
const { Job, User, Transaction, Notification } = require('../models');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res) => {
  try {
    const { title, description, domain, budget } = req.body;

    const job = await Job.create({
      title,
      description,
      domain,
      budget,
      employer: req.user._id
    });

    // Create a transaction record for the deposit
    await Transaction.create({
      job: job._id,
      amount: budget,
      type: 'deposit',
      from: req.user._id,
      to: req.user._id, // This will be updated to the freelancer when assigned
      status: 'completed'
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const domain = req.query.domain || '';
    const searchQuery = req.query.search || '';

    // Build filter object
    const filter = { status: 'open' };
    
    if (domain) {
      filter.domain = domain;
    }
    
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const count = await Job.countDocuments(filter);
    
    const jobs = await Job.find(filter)
      .populate('employer', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      jobs,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email profilePicture')
      .populate('freelancer', 'name email profilePicture')
      .populate('applicants.freelancer', 'name profilePicture');

    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private/Freelancer
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer open for applications' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.find(
      (applicant) => applicant.freelancer.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add application
    job.applicants.push({ freelancer: req.user._id });
    await job.save();

    // Create notification for employer
    await Notification.create({
      recipient: job.employer,
      sender: req.user._id,
      type: 'new_application',
      job: job._id,
      message: `${req.user.name} has applied for your job: ${job.title}`
    });

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Select a freelancer for a job
// @route   PUT /api/jobs/:id/select/:freelancerId
// @access  Private/Employer
const selectFreelancer = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer open' });
    }

    const freelancerId = req.params.freelancerId;
    
    // Check if freelancer applied
    const applied = job.applicants.find(
      (applicant) => applicant.freelancer.toString() === freelancerId
    );

    if (!applied) {
      return res.status(400).json({ message: 'This freelancer has not applied for the job' });
    }

    // Update job
    job.freelancer = freelancerId;
    job.status = 'assigned';
    await job.save();

    // Update transaction
    const transaction = await Transaction.findOne({ 
      job: job._id, 
      type: 'deposit' 
    });
    
    if (transaction) {
      transaction.to = freelancerId;
      await transaction.save();
    }

    // Create notification for freelancer
    await Notification.create({
      recipient: freelancerId,
      sender: req.user._id,
      type: 'job_assigned',
      job: job._id,
      message: `You have been selected for the job: ${job.title}`
    });

    res.json({ message: 'Freelancer selected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job milestone
// @route   PUT /api/jobs/:id/milestone
// @access  Private/Employer
const updateMilestone = async (req, res) => {
  try {
    const { percentage } = req.body;
    
    if (percentage < 0 || percentage > 100 || percentage % 10 !== 0) {
      return res.status(400).json({ message: 'Percentage must be in 10% increments between 0 and 100' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (job.status !== 'assigned') {
      return res.status(400).json({ message: 'This job is not in progress' });
    }

    // Calculate payment amount
    const paymentAmount = (job.budget * (percentage - job.milestonePercentage)) / 100;
    
    // Update job
    job.milestonePercentage = percentage;
    job.paymentReleased += paymentAmount;
    
    if (percentage === 100) {
      job.status = 'completed';
      job.completedAt = Date.now();
      
      // Update freelancer's completed jobs count
      await User.findByIdAndUpdate(job.freelancer, {
        $inc: { completedJobs: 1 }
      });
    }
    
    await job.save();

    // Create transaction record for the payment
    await Transaction.create({
      job: job._id,
      amount: paymentAmount,
      type: 'release',
      from: req.user._id,
      to: job.freelancer,
      percentage,
      status: 'completed'
    });

    // Create notification for freelancer
    await Notification.create({
      recipient: job.freelancer,
      sender: req.user._id,
      type: 'payment_released',
      job: job._id,
      message: `${percentage}% milestone approved and payment released for: ${job.title}`
    });

    res.json({ 
      message: `Milestone updated to ${percentage}% and payment released`,
      paymentAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer
// @access  Private/Employer
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .populate('freelancer', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get freelancer's jobs
// @route   GET /api/jobs/freelancer
// @access  Private/Freelancer
const getFreelancerJobs = async (req, res) => {
  try {
    const appliedJobs = await Job.find({
      'applicants.freelancer': req.user._id,
      status: 'open'
    }).populate('employer', 'name profilePicture');

    const assignedJobs = await Job.find({
      freelancer: req.user._id,
      status: 'assigned'
    }).populate('employer', 'name profilePicture');

    const completedJobs = await Job.find({
      freelancer: req.user._id,
      status: 'completed'
    }).populate('employer', 'name profilePicture');

    res.json({
      applied: appliedJobs,
      assigned: assignedJobs,
      completed: completedJobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate a freelancer
// @route   POST /api/jobs/:id/rate
// @access  Private/Employer
const rateFreelancer = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'You can only rate completed jobs' });
    }

    // Add rating to freelancer
    const freelancer = await User.findById(job.freelancer);
    
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Check if already rated
    const alreadyRated = freelancer.ratings.find(
      (r) => r.job.toString() === job._id.toString()
    );
    if (alreadyRated) {
      return res.status(400).json({ message: 'You have already rated this freelancer for this job' });
    }

    // Add rating
    freelancer.ratings.push({
      rating,
      review,
      from: req.user._id,
      job: job._id
    });

    // Calculate new average rating
    freelancer.averageRating = freelancer.calculateAverageRating();
    
    await freelancer.save();

    // Create notification for freelancer
    await Notification.create({
      recipient: freelancer._id,
      sender: req.user._id,
      type: 'new_rating',
      job: job._id,
      message: `You received a ${rating}-star rating for: ${job.title}`
    });

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  selectFreelancer,
  updateMilestone,
  getEmployerJobs,
  getFreelancerJobs,
  rateFreelancer
};