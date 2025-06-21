const { User, Job, Chat, Notification, Transaction, Admin } = require('../models');
const { createAndEmitNotification } = require('../utils/notificationHelper');
const mongoose = require('mongoose');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [
      totalUsers,
      totalFreelancers,
      totalEmployers,
      totalJobs,
      activeJobs,
      completedJobs,
      totalTransactions,
      activeChats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'completed' }),
      Transaction.countDocuments(),
      Chat.countDocuments({ archived: false })
    ]);

    // Get transaction amount totals
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersLast30Days,
      newJobsLast30Days,
      transactionsLast30Days
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Transaction.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Get user growth data (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userGrowthData = await User.aggregate([
      {
        $match: { createdAt: { $gte: twelveMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get job statistics by domain
    const jobsByDomain = await Job.aggregate([
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalFreelancers,
        totalEmployers,
        totalJobs,
        activeJobs,
        completedJobs,
        totalTransactions,
        activeChats,
        totalTransactionAmount: transactionStats[0]?.totalAmount || 0,
        avgTransactionAmount: transactionStats[0]?.avgAmount || 0
      },
      recentActivity: {
        newUsersLast30Days,
        newJobsLast30Days,
        transactionsLast30Days
      },
      growth: {
        userGrowthData,
        jobsByDomain
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query['accountStatus.isActive'] = true;
      } else if (status === 'inactive') {
        query['accountStatus.isActive'] = false;
      }
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('ratings.from', 'name profilePicture')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional user statistics
    const [userJobs, userTransactions, userChats] = await Promise.all([
      Job.find({
        $or: [
          { employer: user._id },
          { selectedFreelancer: user._id }
        ]
      }).lean(),
      Transaction.find({
        $or: [
          { from: user._id },
          { to: user._id }
        ]
      }).lean(),
      Chat.find({
        $or: [
          { employer: user._id },
          { freelancer: user._id }
        ]
      }).lean()
    ]);

    res.json({
      user,
      statistics: {
        totalJobs: userJobs.length,
        completedJobs: userJobs.filter(job => job.status === 'completed').length,
        totalTransactions: userTransactions.length,
        totalChats: userChats.length,
        totalEarnings: userTransactions
          .filter(t => t.to.toString() === user._id.toString())
          .reduce((sum, t) => sum + t.amount, 0),
        totalSpent: userTransactions
          .filter(t => t.from.toString() === user._id.toString())
          .reduce((sum, t) => sum + t.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

// @desc    Update user status (suspend/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status
    user.accountStatus = {
      ...user.accountStatus,
      isActive,
      lastStatusChange: new Date(),
      statusChangeReason: reason || ''
    };

    await user.save();

    // Log admin action
    await logAdminAction({
      action: isActive ? 'user_activation' : 'user_suspension',
      description: `User ${user.name} (${user.email}) ${isActive ? 'activated' : 'suspended'}. Reason: ${reason || 'No reason provided'}`,
      relatedUser: userId,
      performedBy: req.user._id
    });

    // Send notification to user using helper
    const io = req.app.get('io');
    await createAndEmitNotification(io, {
      recipient: userId,
      sender: req.user._id,
      type: isActive ? 'account_reactivated' : 'account_suspended',
      title: isActive ? 'Account Reactivated' : 'Account Suspended',
      message: isActive 
        ? 'Your account has been reactivated by an administrator. You can now access all features.'
        : `Your account has been suspended by an administrator. Reason: ${reason || 'Violation of terms of service'}`,
      metadata: {
        reason,
        adminAction: true,
        statusChange: isActive ? 'activated' : 'suspended'
      }
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

// @desc    Get all jobs with pagination and filters
// @route   GET /api/admin/jobs
// @access  Admin
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      domain = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (domain && domain !== 'all') {
      query.domain = domain;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .populate('employer', 'name email profilePicture')
        .populate('selectedFreelancer', 'name email profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// @desc    Delete/Remove a job
// @route   DELETE /api/admin/jobs/:id
// @access  Admin
const removeJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId).populate('employer', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if job can be safely deleted
    if (job.status === 'active' && job.selectedFreelancer) {
      return res.status(400).json({ 
        message: 'Cannot delete job with active freelancer. Please resolve first.' 
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    // Log admin action
    await logAdminAction({
      action: 'job_removal',
      description: `Job "${job.title}" removed. Reason: ${reason || 'No reason provided'}`,
      relatedJob: jobId,
      relatedUser: job.employer._id,
      performedBy: req.user._id
    });

    // Send notification to employer
    const io = req.app.get('io');
    const notificationData = {
      recipient: job.employer._id,
      type: 'job_removed',
      title: 'Job Removed',
      message: `Your job "${job.title}" has been removed by an administrator. Reason: ${reason || 'Violation of terms of service'}`,
      category: 'job'
    };

    const notification = await Notification.create(notificationData);
    io.to(`user_${job.employer._id}`).emit('notification', notification);

    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error('Error removing job:', error);
    res.status(500).json({ message: 'Failed to remove job' });
  }
};

// @desc    Get admin activity logs
// @route   GET /api/admin/activity
// @access  Admin
const getAdminActivity = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action = '',
      adminId = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    // Build query for admin logs
    const query = {};
    
    if (action && action !== 'all') {
      query['actions.action'] = action;
    }
    
    if (adminId && adminId !== 'all') {
      query['actions.performedBy'] = adminId;
    }
    
    if (dateFrom || dateTo) {
      query['actions.createdAt'] = {};
      if (dateFrom) query['actions.createdAt'].$gte = new Date(dateFrom);
      if (dateTo) query['actions.createdAt'].$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get admin records and extract actions
    const adminRecords = await Admin.find(query)
      .populate('actions.performedBy', 'name email')
      .populate('actions.relatedUser', 'name email')
      .populate('actions.relatedJob', 'title')
      .lean();

    // Flatten actions from all admin records
    let allActions = [];
    adminRecords.forEach(record => {
      allActions.push(...record.actions);
    });

    // Filter actions based on query parameters
    if (action && action !== 'all') {
      allActions = allActions.filter(a => a.action === action);
    }
    
    if (adminId && adminId !== 'all') {
      allActions = allActions.filter(a => a.performedBy._id.toString() === adminId);
    }
    
    if (dateFrom) {
      allActions = allActions.filter(a => new Date(a.createdAt) >= new Date(dateFrom));
    }
    
    if (dateTo) {
      allActions = allActions.filter(a => new Date(a.createdAt) <= new Date(dateTo));
    }

    // Sort by creation date (newest first)
    allActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const totalActions = allActions.length;
    const paginatedActions = allActions.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(totalActions / parseInt(limit));

    res.json({
      activities: paginatedActions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalActions,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ message: 'Failed to fetch admin activity' });
  }
};

// @desc    Get system health and metrics
// @route   GET /api/admin/system
// @access  Admin
const getSystemHealth = async (req, res) => {
  try {
    // Database metrics
    const dbStats = await mongoose.connection.db.stats();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    // Uptime
    const uptime = process.uptime();
    
    // Active connections (if available through socket.io)
    const io = req.app.get('io');
    const socketConnections = io?.sockets?.sockets?.size || 0;

    // Recent error logs (you might want to implement proper logging)
    const recentErrors = []; // Implement based on your logging system

    // Database connection status
    const dbConnection = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };

    const systemHealth = {
      database: {
        connection: dbConnection,
        stats: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes
        }
      },
      server: {
        uptime: uptime,
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        nodeVersion: process.version,
        platform: process.platform
      },
      realtime: {
        socketConnections,
        status: socketConnections > 0 ? 'active' : 'inactive'
      },
      errors: recentErrors
    };

    res.json(systemHealth);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ message: 'Failed to fetch system health' });
  }
};

// Helper function to log admin actions
const logAdminAction = async (actionData) => {
  try {
    // Find or create admin record
    let adminRecord = await Admin.findOne({});
    if (!adminRecord) {
      adminRecord = new Admin({
        actions: [],
        statistics: {}
      });
    }

    // Add action to the record
    adminRecord.actions.push(actionData);
    adminRecord.lastUpdated = new Date();

    await adminRecord.save();
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getJobs,
  removeJob,
  getAdminActivity,
  getSystemHealth
};