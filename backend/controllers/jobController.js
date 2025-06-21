// backend/controllers/jobController.js
const { Job, User, Transaction, Notification, Escrow, Domain } = require("../models");
const { createEscrowDeposit, createEscrowRelease } = require("../utils/transactionHelpers");
const { createAndEmitNotification } = require("../utils/notificationHelper");
const RecommendationService = require('../utils/recommendationService');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res) => {
  try {
    const { title, description, domain, budget } = req.body;
    
    if (req.user.isSuspended) {
        return res
          .status(403)
          .json({ message: "Your account is suspended and you cannot create jobs." });
    }
    
    const job = await Job.create({
      title,
      description,
      domain,
      budget,
      employer: req.user._id,
    });

    // Create escrow record
    const escrow = await Escrow.create({
      job: job._id,
      employer: req.user._id,
      totalAmount: budget,
      status: 'pending',
      milestones: []
    });

    // Create transaction record for employer depositing money into escrow
    await createEscrowDeposit(job._id, req.user._id, escrow._id, budget);

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get freelancer's applied jobs
// @route   GET /api/jobs/applied
// @access  Private/Freelancer
const getAppliedJobs = async (req, res) => {
  try {
    const appliedJobs = await Job.find({
      "applicants.freelancer": req.user._id
    })
    .populate("employer", "name profilePicture")
    .populate("domain", "name icon")
    .sort({ createdAt: -1 });

    // Add a flag to indicate the application status for each job
    const jobsWithApplicationStatus = appliedJobs.map(job => {
      const jobObj = job.toObject();
      
      // Check if the job is assigned to this freelancer
      if (job.freelancer && job.freelancer.toString() === req.user._id.toString()) {
        jobObj.applicationStatus = 'accepted';
      } else if (job.status === 'open') {
        jobObj.applicationStatus = 'pending';
      } else {
        jobObj.applicationStatus = 'rejected';
      }
      
      return jobObj;
    });

    res.json(jobsWithApplicationStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const domain = req.query.domain || "";
    const searchQuery = req.query.search || "";

    // Build filter object
    const filter = { status: "open" };

    if (domain) {
      filter.domain = domain;
    }

    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const count = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate("employer", "name profilePicture")
      .populate("domain", "name icon")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      jobs,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "name email profilePicture")
      .populate("freelancer", "name email profilePicture")
      .populate("applicants.freelancer", "name profilePicture skills averageRating completedJobs");

    if (job) {
      // Get employer job count
      let employerJobCount = 0;
      if (job.employer && job.employer._id) {
        employerJobCount = await Job.countDocuments({ employer: job.employer._id });
      }

      // Convert to object and add jobCount to employer
      const jobObj = job.toObject();
      if (jobObj.employer) {
        jobObj.employer.jobCount = employerJobCount;
      }

      res.json(jobObj);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private/Freelancer
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res
        .status(400)
        .json({ message: "This job is no longer open for applications" });
    }
    if (req.user.isSuspended) {
      return res
        .status(403)
        .json({ message: "Your account is suspended and you cannot apply for jobs." });
    }
    // Check if already applied
    const alreadyApplied = job.applicants.find(
      (applicant) => applicant.freelancer.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Add application
    job.applicants.push({ freelancer: req.user._id });
    await job.save();

    // Create and emit notification for employer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: job.employer,
      sender: req.user._id,
      type: "new_application",
      title: "New Job Application",
      message: `${req.user.name} has applied for your job: ${job.title}`,
      job: job._id,
      link: `/jobs/${job._id}/applications`,
      actions: [
        {
          label: 'View Application',
          link: `/jobs/${job._id}/applications`,
          primary: true
        },
        {
          label: 'View Job',
          link: `/jobs/${job._id}`,
          primary: false
        }
      ],
      metadata: {
        applicantName: req.user.name,
        jobTitle: job.title,
        totalApplications: job.applicants.length
      }
    });

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Select a freelancer for a job
// @route   PUT /api/jobs/:id/select/:freelancerId
// @access  Private/Employer
const selectFreelancer = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is no longer open" });
    }

    const freelancerId = req.params.freelancerId;
    
    // Check if employer or freelancer is suspended
    const employer = await User.findById(req.user._id);
    const freelancer = await User.findById(freelancerId);

    if (employer.isSuspended) {
      return res
        .status(403)
        .json({ message: "Your account is suspended and you cannot select a freelancer." });
    }

    if (freelancer.isSuspended) {
      return res
        .status(403)
        .json({ message: "This freelancer's account is suspended and cannot be selected." });
    }
    
    // Check if freelancer applied
    const applied = job.applicants.find(
      (applicant) => applicant.freelancer.toString() === freelancerId
    );

    if (!applied) {
      return res
        .status(400)
        .json({ message: "This freelancer has not applied for the job" });
    }

    // Update job
    job.freelancer = freelancerId;
    job.status = "assigned";
    await job.save();

    // Update escrow status
    const escrow = await Escrow.findOne({ job: job._id });
    if (escrow) {
      escrow.freelancer = freelancerId;
      escrow.status = 'active';
      await escrow.save();
    }

    // Create and emit notification for freelancer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: freelancerId,
      sender: req.user._id,
      type: "job_assigned",
      title: "Job Assignment",
      message: `Congratulations! You have been selected for the job: ${job.title}`,
      job: job._id,
      link: `/jobs/${job._id}`,
      actions: [
        {
          label: 'View Job Details',
          link: `/jobs/${job._id}`,
          primary: true
        },
        {
          label: 'Start Chat',
          link: `/chats/job/${job._id}`,
          primary: false
        }
      ],
      metadata: {
        jobTitle: job.title,
        employerName: req.user.name,
        budget: job.budget,
        deadline: job.deadline
      }
    });

    res.json({ message: "Freelancer selected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer
// @access  Private/Employer
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .populate("freelancer", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get freelancer's jobs
// @route   GET /api/jobs/freelancer
// @access  Private/Freelancer
const getFreelancerJobs = async (req, res) => {
  try {
    const appliedJobs = await Job.find({
      "applicants.freelancer": req.user._id,
      status: "open",
    }).populate("employer", "name profilePicture");

    const assignedJobs = await Job.find({
      freelancer: req.user._id,
      status: "assigned",
    }).populate("employer", "name profilePicture");

    const completedJobs = await Job.find({
      freelancer: req.user._id,
      status: "completed",
    }).populate("employer", "name profilePicture");

    res.json({
      applied: appliedJobs,
      assigned: assignedJobs,
      completed: completedJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Rate a freelancer
// @route   POST /api/jobs/:id/rate
// @access  Private/Employer
const rateFreelancer = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (job.status !== "completed") {
      return res
        .status(400)
        .json({ message: "You can only rate completed jobs" });
    }

    // Add rating to freelancer
    const freelancer = await User.findById(job.freelancer);

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // Check if already rated
    const alreadyRated = freelancer.ratings.find(
      (r) => r.job.toString() === job._id.toString()
    );
    if (alreadyRated) {
      return res
        .status(400)
        .json({
          message: "You have already rated this freelancer for this job",
        });
    }

    // Add rating
    freelancer.ratings.push({
      rating,
      review,
      from: req.user._id,
      job: job._id,
    });

    // Calculate new average rating
    freelancer.averageRating = freelancer.calculateAverageRating();

    await freelancer.save();

    // Update job to mark as rated by employer
    job.isRatedByEmployer = true;
    await job.save();

    // Create and emit notification for freelancer
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: freelancer._id,
      sender: req.user._id,
      type: "new_rating",
      title: "New Review Received",
      message: `You received a ${rating}-star rating from ${req.user.name} for: ${job.title}`,
      job: job._id,
      link: `/profile/reviews`,
      actions: [
        {
          label: 'View Review',
          link: `/profile/reviews`,
          primary: true
        },
        {
          label: 'View Job',
          link: `/jobs/${job._id}`,
          primary: false
        }
      ],
      metadata: {
        rating: rating,
        review: review,
        reviewerName: req.user.name,
        jobTitle: job.title,
        newAverageRating: freelancer.averageRating
      }
    });

    res.json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}; 

// @desc    Get recommended jobs for freelancer
// @route   GET /api/jobs/recommended
// @access  Private/Freelancer
const getRecommendedJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const recommendedJobs = await RecommendationService.getRecommendedJobs(
      req.user._id, 
      limit
    );

    res.json({
      success: true,
      jobs: recommendedJobs,
      count: recommendedJobs.length
    });
  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while getting recommendations' 
    });
  }
};


const getSuggestedDomains = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const suggestedDomains = await RecommendationService.getSuggestedDomains(
      user.skills || []
    );

    res.json({
      success: true,
      domains: suggestedDomains
    });
  } catch (error) {
    console.error('Error getting suggested domains:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while getting domain suggestions' 
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  selectFreelancer,
  getEmployerJobs,
  getFreelancerJobs,
  rateFreelancer,
  getAppliedJobs,
  getRecommendedJobs,
  getSuggestedDomains
};  