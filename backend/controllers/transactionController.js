// backend/controllers/transactionController.js
const { Transaction } = require('../models');
const { getUserTransactions, getJobTransactions, getEscrowBalance, getTransactionSummary } = require('../utils/transactionHelpers');

// @desc    Get user's transactions
// @route   GET /api/transactions
// @access  Private
const getUserTransactionHistory = async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user._id);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transactions for a specific job
// @route   GET /api/transactions/job/:jobId
// @access  Private
const getJobTransactionHistory = async (req, res) => {
  try {
    const transactions = await getJobTransactions(req.params.jobId);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get escrow balance for a job
// @route   GET /api/transactions/escrow/:jobId
// @access  Private
const getJobEscrowBalance = async (req, res) => {
  try {
    const balance = await getEscrowBalance(req.params.jobId);
    res.json({ balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction summary (admin only)
// @route   GET /api/transactions/summary
// @access  Private/Admin
const getTransactionSummaryData = async (req, res) => {
  try {
    const summary = await getTransactionSummary();
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'from',
        model: function() { return this.fromModel; }
      })
      .populate({
        path: 'to',
        model: function() { return this.toModel; }
      })
      .populate('job', 'title status');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is authorized to view this transaction
    const isAuthorized = 
      (transaction.fromModel === 'User' && transaction.from._id.toString() === req.user._id.toString()) ||
      (transaction.toModel === 'User' && transaction.to._id.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserTransactionHistory,
  getJobTransactionHistory,
  getJobEscrowBalance,
  getTransactionSummaryData,
  getTransactionById
};