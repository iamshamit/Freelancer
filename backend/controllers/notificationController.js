// backend/controllers/notificationController.js
const { Notification, User } = require('../models'); // Add User import
const { createAndEmitNotification, getTimeAgo } = require('../utils/notificationHelper');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      sortBy = 'newest'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { recipient: req.user._id };

    // Category filter
    if (category && category !== 'all') {
      const categoryMap = {
        'application': ['new_application', 'job_assigned'],
        'message': ['new_message'],
        'payment': ['payment_released'],
        'milestone': ['milestone_completed', 'milestone_approval_requested', 'milestone_approved', 'milestones_created'],
        'rating': ['new_rating'],
        'account': ['account_suspended']
      };
      
      if (categoryMap[category]) {
        query.type = { $in: categoryMap[category] };
      }
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'unread') {
        query.read = false;
      } else if (status === 'read') {
        query.read = true;
      } else if (status === 'archived') {
        query.archived = true;
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'unread':
        sortOptions = { read: 1, createdAt: -1 };
        break;
      case 'type':
        sortOptions = { type: 1, createdAt: -1 };
        break;
      default: // newest
        sortOptions = { createdAt: -1 };
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name profilePicture')
      .populate('job', 'title')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Add time ago and format for frontend
    const formattedNotifications = notifications.map(notification => {
      const timeAgo = getTimeAgo(notification.createdAt);
      return {
        ...notification.toObject(),
        timeAgo
      };
    });

    // Check if there are more notifications
    const total = await Notification.countDocuments(query);
    const hasMore = skip + notifications.length < total;

    res.json({
      notifications: formattedNotifications,
      hasMore,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification category counts
// @route   GET /api/notifications/category-counts
// @access  Private
const getCategoryCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const counts = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Map to categories
    const categoryMap = {
      'application': ['new_application', 'job_assigned'],
      'message': ['new_message'],
      'payment': ['payment_released'],
      'milestone': ['milestone_completed', 'milestone_approval_requested', 'milestone_approved', 'milestones_created'],
      'rating': ['new_rating'],
      'account': ['account_suspended']
    };

    const categoryCounts = {
      all: 0,
      application: 0,
      message: 0,
      payment: 0,
      milestone: 0,
      rating: 0
    };

    counts.forEach(({ _id, count }) => {
      categoryCounts.all += count;
      
      Object.keys(categoryMap).forEach(category => {
        if (categoryMap[category].includes(_id)) {
          categoryCounts[category] += count;
        }
      });
    });

    res.json(categoryCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/mark-read-multiple
// @access  Private
const markMultipleAsRead = async (req, res) => {
  try {
    const { ids } = req.body;

    await Notification.updateMany(
      { 
        _id: { $in: ids }, 
        recipient: req.user._id 
      },
      { read: true }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete multiple notifications
// @route   DELETE /api/notifications/multiple
// @access  Private
const deleteMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body;

    await Notification.deleteMany({
      _id: { $in: ids },
      recipient: req.user._id
    });

    res.json({ message: 'Notifications deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Archive multiple notifications
// @route   PUT /api/notifications/archive-multiple
// @access  Private
const archiveMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body;

    await Notification.updateMany(
      { 
        _id: { $in: ids }, 
        recipient: req.user._id 
      },
      { archived: true }
    );

    res.json({ message: 'Notifications archived' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    
    const defaultPreferences = {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          new_application: true,
          job_assigned: true,
          milestone_completed: true,
          payment_released: true,
          new_message: true,
          new_rating: true
        }
      },
      push: {
        enabled: true,
        types: {
          new_application: true,
          job_assigned: true,
          milestone_completed: true,
          payment_released: true,
          new_message: true,
          new_rating: false
        }
      },
      inApp: {
        enabled: true,
        sound: true,
        types: {
          new_application: true,
          job_assigned: true,
          milestone_completed: true,
          payment_released: true,
          new_message: true,
          new_rating: true
        }
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    const preferences = user.notificationPreferences || defaultPreferences;
    res.json(preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const preferences = req.body;

    await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: preferences },
      { new: true }
    );

    res.json({ message: 'Notification preferences updated', preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
const sendTestNotification = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user._id;

    const testMessages = {
      'new_application': {
        title: 'Test: New Application',
        message: 'This is a test notification for new job applications.'
      },
      'job_assigned': {
        title: 'Test: Job Assignment',
        message: 'This is a test notification for job assignments.'
      },
      'milestone_completed': {
        title: 'Test: Milestone Update',
        message: 'This is a test notification for milestone updates.'
      },
      'payment_released': {
        title: 'Test: Payment Released',
        message: 'This is a test notification for payment releases.'
      },
      'new_message': {
        title: 'Test: New Message',
        message: 'This is a test notification for new messages.'
      },
      'new_rating': {
        title: 'Test: New Review',
        message: 'This is a test notification for new reviews and ratings.'
      },
      'account_suspended': { // ADDED
        title: 'Test: Account Suspended',
        message: 'This is a test notification for account suspensions.'
      }
    };

    const testMessage = testMessages[type] || testMessages['new_message'];

    // Use the notification helper to create and emit
    const io = req.app.get('io');
    const notification = await createAndEmitNotification(io, {
      recipient: userId,
      sender: userId,
      type: type,
      title: testMessage.title,
      message: testMessage.message
    });

    res.json({ message: 'Test notification sent', notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getCategoryCounts,
  markMultipleAsRead,
  deleteMultipleNotifications,
  archiveMultipleNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification
};