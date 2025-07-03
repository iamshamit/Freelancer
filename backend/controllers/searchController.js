const { Job, User, Domain } = require("../models");

// @desc    Global search across jobs and freelancers
// @route   GET /api/search
// @access  Private
const globalSearch = async (req, res) => {
  try {
    const { query, type = 'all', page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        jobs: [],
        freelancers: [],
        totalResults: 0
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const skip = (page - 1) * limit;

    let results = {
      jobs: [],
      freelancers: [],
      totalResults: 0
    };

    // Search jobs
    if (type === 'all' || type === 'jobs') {
      const jobFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ],
        status: 'open'
      };

      const jobs = await Job.find(jobFilter)
        .populate('employer', 'name profilePicture')
        .populate('domain', 'name icon')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const jobCount = await Job.countDocuments(jobFilter);
      
      results.jobs = jobs;
      results.totalResults += jobCount;
    }

    // Search freelancers
    if (type === 'all' || type === 'freelancers') {
      const freelancerFilter = {
        role: 'freelancer',
        'privacySettings.search.appearInSearch': true,
        'privacySettings.search.showInDirectory': true,
        'accountStatus.isActive': true,
        'accountStatus.isSuspended': false,
        $or: [
          { name: searchRegex },
          { bio: searchRegex },
          { skills: { $in: [searchRegex] } }
        ]
      };

      const freelancers = await User.find(freelancerFilter)
        .select('name profilePicture bio skills averageRating completedJobs')
        .sort({ averageRating: -1, completedJobs: -1 })
        .limit(limit)
        .skip(skip);

      const freelancerCount = await User.countDocuments(freelancerFilter);
      
      results.freelancers = freelancers;
      results.totalResults += freelancerCount;
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Private
const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(`^${query}`, 'i');
    
    // Get job title suggestions
    const jobSuggestions = await Job.distinct('title', {
      title: searchRegex,
      status: 'open'
    }).limit(5);

    // Get skill suggestions from freelancers who appear in search
    const skillSuggestions = await User.distinct('skills', {
      skills: searchRegex,
      role: 'freelancer',
      'privacySettings.search.appearInSearch': true,
      'accountStatus.isActive': true
    }).limit(5);

    // Get domain suggestions
    const domainSuggestions = await Domain.find({
      name: searchRegex
    }).select('name').limit(3);

    const suggestions = [
      ...jobSuggestions.map(title => ({ type: 'job', text: title })),
      ...skillSuggestions.map(skill => ({ type: 'skill', text: skill })),
      ...domainSuggestions.map(domain => ({ type: 'domain', text: domain.name }))
    ];

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get freelancers with filters
// @route   GET /api/search/freelancers
// @access  Private
const searchFreelancers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      skills,
      minRating,
      domain,
      sortBy = 'rating'
    } = req.query;

    const filter = { 
      role: 'freelancer',
      'privacySettings.search.appearInSearch': true,
      'privacySettings.search.showInDirectory': true,
      'accountStatus.isActive': true,
      'accountStatus.isSuspended': false
    };

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filter.skills = { $in: skillsArray };
    }

    // Rating filter
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Sort options
    const sortOptions = {
      rating: { averageRating: -1, completedJobs: -1 },
      jobs: { completedJobs: -1, averageRating: -1 },
      newest: { createdAt: -1 }
    };

    const skip = (page - 1) * limit;

    const freelancers = await User.find(filter)
      .select('name profilePicture bio skills averageRating completedJobs ratings')
      .populate({
        path: 'ratings',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: {
          path: 'from',
          select: 'name profilePicture'
        }
      })
      .sort(sortOptions[sortBy] || sortOptions.rating)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.json({
      freelancers,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get job recommendations based on user skills
// @route   GET /api/search/recommendations
// @access  Private
const getJobRecommendations = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.json({ recommendations: [] });
    }

    const userSkills = req.user.skills || [];
    
    if (userSkills.length === 0) {
      // Return recent jobs if user has no skills
      const recentJobs = await Job.find({ status: 'open' })
        .populate('employer', 'name profilePicture')
        .populate('domain', 'name icon')
        .sort({ createdAt: -1 })
        .limit(6);
      
      return res.json({ recommendations: recentJobs });
    }

    // Find jobs matching user skills
    const recommendations = await Job.find({
      status: 'open',
      $or: [
        { title: { $regex: userSkills.join('|'), $options: 'i' } },
        { description: { $regex: userSkills.join('|'), $options: 'i' } }
      ]
    })
    .populate('employer', 'name profilePicture')
    .populate('domain', 'name icon')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({ recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Save a search
// @route   POST /api/search/saved
// @access  Private
const saveSearch = async (req, res) => {
  try {
    const { query, filters, type } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user.savedSearches) {
      user.savedSearches = [];
    }

    // Check if search already exists
    const existingSearch = user.savedSearches.find(
      search => search.query === query && search.type === type
    );

    if (existingSearch) {
      return res.status(400).json({ message: "Search already saved" });
    }

    user.savedSearches.push({
      query,
      filters,
      type,
      createdAt: new Date()
    });

    // Keep only last 10 saved searches
    if (user.savedSearches.length > 10) {
      user.savedSearches = user.savedSearches.slice(-10);
    }

    await user.save();
    
    res.json({ message: "Search saved successfully", savedSearches: user.savedSearches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get saved searches
// @route   GET /api/search/saved
// @access  Private
const getSavedSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ savedSearches: user.savedSearches || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a saved search
// @route   DELETE /api/search/saved/:searchId
// @access  Private
const deleteSavedSearch = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.savedSearches = user.savedSearches.filter(
      search => search._id.toString() !== req.params.searchId
    );
    
    await user.save();
    
    res.json({ message: "Search deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  globalSearch,
  getSearchSuggestions,
  searchFreelancers,
  getJobRecommendations,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch
};