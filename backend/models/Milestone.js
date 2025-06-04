// backend/models/Milestone.js
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'approved', 'rejected'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  feedback: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
milestoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;