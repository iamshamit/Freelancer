// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_application', 
      'job_assigned', 
      'milestone_completed', 
      'payment_released', 
      'job_completed', 
      'new_message',
      'new_rating',
      'milestones_created',
      'milestone_approval_requested',
      'milestone_approved'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  message: String,
  link: String,
  read: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  actions: [{
    label: String,
    link: String,
    primary: Boolean
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, archived: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;