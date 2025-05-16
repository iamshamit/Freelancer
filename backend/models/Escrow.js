// backend/models/Escrow.js
const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  releasedAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'refunded', 'disputed'],
    default: 'pending'
  },
  milestones: [{
    percentage: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    released: {
      type: Boolean,
      default: false
    },
    releasedAt: {
      type: Date
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
escrowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Escrow = mongoose.model('Escrow', escrowSchema);

module.exports = Escrow;