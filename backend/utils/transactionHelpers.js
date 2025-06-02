// backend/utils/transactionHelpers.js
const { Transaction, User, Escrow } = require('../models');

// Get all transactions for a user (sent and received)
const getUserTransactions = async (userId) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { from: userId, fromModel: 'User' },
        { to: userId, toModel: 'User' }
      ]
    })
    .populate({
      path: 'from',
      model: function() { return this.fromModel; },
      select: 'name email'
    })
    .populate({
      path: 'to', 
      model: function() { return this.toModel; },
      select: 'name email'
    })
    .populate('job', 'title status')
    .sort({ createdAt: -1 });

    return transactions;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
};

// Get all transactions for a specific job
const getJobTransactions = async (jobId) => {
  try {
    const transactions = await Transaction.find({ job: jobId })
    .populate({
      path: 'from',
      model: function() { return this.fromModel; }
    })
    .populate({
      path: 'to',
      model: function() { return this.toModel; }
    })
    .sort({ createdAt: 1 });

    return transactions;
  } catch (error) {
    console.error('Error fetching job transactions:', error);
    return [];
  }
};

// Get escrow balance for a job
const getEscrowBalance = async (jobId) => {
  try {
    const escrow = await Escrow.findOne({ job: jobId });
    if (!escrow) return 0;

    const deposited = escrow.totalAmount;
    const released = escrow.releasedAmount || 0;
    return deposited - released;
  } catch (error) {
    console.error('Error calculating escrow balance:', error);
    return 0;
  }
};

// Create escrow deposit transaction
const createEscrowDeposit = async (jobId, employerId, escrowId, amount) => {
  try {
    const transaction = await Transaction.create({
      job: jobId,
      amount,
      type: 'deposit',
      from: employerId,
      fromModel: 'User',
      to: escrowId,
      toModel: 'Escrow',
      status: 'completed'
    });
    return transaction;
  } catch (error) {
    console.error('Error creating escrow deposit:', error);
    throw error;
  }
};

// Create escrow release transaction
const createEscrowRelease = async (jobId, escrowId, freelancerId, amount, percentage = null) => {
  try {
    const transactionData = {
      job: jobId,
      amount,
      type: 'release',
      from: escrowId,
      fromModel: 'Escrow',
      to: freelancerId,
      toModel: 'User',
      status: 'completed'
    };

    if (percentage !== null) {
      transactionData.percentage = percentage;
    }

    const transaction = await Transaction.create(transactionData);
    return transaction;
  } catch (error) {
    console.error('Error creating escrow release:', error);
    throw error;
  }
};

// Create refund transaction (escrow back to employer)
const createEscrowRefund = async (jobId, escrowId, employerId, amount) => {
  try {
    const transaction = await Transaction.create({
      job: jobId,
      amount,
      type: 'refund',
      from: escrowId,
      fromModel: 'Escrow',
      to: employerId,
      toModel: 'User',
      status: 'completed'
    });
    return transaction;
  } catch (error) {
    console.error('Error creating escrow refund:', error);
    throw error;
  }
};

// Get transaction summary for admin dashboard
const getTransactionSummary = async () => {
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const totalTransactions = await Transaction.countDocuments();
    const totalVolume = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      byType: summary,
      totalTransactions,
      totalVolume: totalVolume[0]?.total || 0
    };
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    return null;
  }
};

module.exports = {
  getUserTransactions,
  getJobTransactions,
  getEscrowBalance,
  createEscrowDeposit,
  createEscrowRelease,
  createEscrowRefund,
  getTransactionSummary
};