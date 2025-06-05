// backend/utils/notificationHelper.js
const { Notification } = require('../models');

// Helper function to create and emit notifications
const createAndEmitNotification = async (io, notificationData) => {
  try {
    // Create notification in database
    const notification = new Notification({
      recipient: notificationData.recipient,
      sender: notificationData.sender,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      job: notificationData.job,
      chat: notificationData.chat,
      link: notificationData.link,
      actions: notificationData.actions,
      metadata: notificationData.metadata
    });

    await notification.save();

    // Populate sender information
    await notification.populate('sender', 'name profilePicture');
    await notification.populate('job', 'title');

    // Add timeAgo field
    const notificationWithTimeAgo = {
      ...notification.toObject(),
      timeAgo: getTimeAgo(notification.createdAt)
    };

    // Emit real-time notification
    if (io) {
      io.to(`user_${notificationData.recipient}`).emit('new-notification', notificationWithTimeAgo);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

module.exports = {
  createAndEmitNotification,
  getTimeAgo
};