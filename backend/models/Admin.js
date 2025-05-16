// backend/models/Admin.js
const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['job_removal', 'user_suspension', 'dispute_resolution', 'other']
  },
  description: {
    type: String,
    required: true
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const adminSchema = new mongoose.Schema({
  actions: [adminActionSchema],
  statistics: {
    totalUsers: {
      type: Number,
      default: 0
    },
    totalJobs: {
      type: Number,
      default: 0
    },
    totalCompletedJobs: {
      type: Number,
      default: 0
    },
    totalActiveJobs: {
      type: Number,
      default: 0
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalTransactionAmount: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;