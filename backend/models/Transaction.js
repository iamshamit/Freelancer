// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'release', 'refund'],
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'fromModel',
    required: true
  },
  fromModel: {
    type: String,
    required: true,
    enum: ['User', 'Escrow']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'toModel',
    required: true
  },
  toModel: {
    type: String,
    required: true,
    enum: ['User', 'Escrow']
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;