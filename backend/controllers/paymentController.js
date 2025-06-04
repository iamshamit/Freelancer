// backend/controllers/paymentController.js
const { Transaction, Job, User, Milestone, Escrow } = require('../models');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get payment history with filters
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { dateRange, status } = req.query;
    const userId = req.user._id;
    
    // Build query
    const query = {
      $or: [
        { from: userId, fromModel: 'User' },
        { to: userId, toModel: 'User' }
      ]
    };

    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const transactions = await Transaction.find(query)
      .populate('job', 'title')
      .populate({
        path: 'from',
        select: 'name email',
        refPath: 'fromModel'
      })
      .populate({
        path: 'to',
        select: 'name email',
        refPath: 'toModel'
      })
      .sort({ createdAt: -1 });

    // Transform transactions for frontend
    const payments = await Promise.all(transactions.map(async (transaction) => {
      const job = await Job.findById(transaction.job).populate('employer freelancer');
      
      // Get milestone info if available
      let milestoneTitle = `${transaction.percentage || 0}% Milestone`;
      if (transaction.percentage) {
        const milestone = await Milestone.findOne({
          job: transaction.job,
          percentage: transaction.percentage
        });
        if (milestone) {
          milestoneTitle = milestone.title;
        }
      }

      return {
        _id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        date: transaction.createdAt,
        description: `Payment for ${job.title}`,
        milestoneTitle,
        transactionId: transaction._id.toString().slice(-8).toUpperCase(),
        type: transaction.type,
        job: {
          _id: job._id,
          title: job.title,
          employer: job.employer.name,
          freelancer: job.freelancer?.name
        }
      };
    }));

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:paymentId/receipt
// @access  Private
const getPaymentReceipt = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.paymentId)
      .populate('job')
      .populate({
        path: 'from',
        refPath: 'fromModel'
      })
      .populate({
        path: 'to',
        refPath: 'toModel'
      });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    const isAuthorized = 
      (transaction.fromModel === 'User' && transaction.from._id.toString() === req.user._id.toString()) ||
      (transaction.toModel === 'User' && transaction.to._id.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Generate PDF receipt
    const doc = new PDFDocument();
    const filename = `receipt-${transaction._id}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Receipt Number: ${transaction._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${transaction.status.toUpperCase()}`);
    doc.moveDown();

    doc.text(`Job: ${transaction.job.title}`);
    doc.text(`Amount: $${transaction.amount}`);
    doc.text(`Type: ${transaction.type}`);
    
    if (transaction.percentage) {
      doc.text(`Milestone: ${transaction.percentage}%`);
    }
    
    doc.moveDown();
    doc.text('This is an official receipt for the transaction.', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get escrow balance for a job
// @route   GET /api/jobs/:jobId/escrow
// @access  Private
const getEscrowBalance = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    const isAuthorized = 
      job.employer.toString() === req.user._id.toString() ||
      job.freelancer?.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const escrow = await Escrow.findOne({ job: jobId });
    if (!escrow) {
      return res.status(404).json({ message: 'Escrow not found' });
    }

    res.json({
      balance: escrow.totalAmount - escrow.releasedAmount,
      totalBudget: escrow.totalAmount,
      released: escrow.releasedAmount,
      status: escrow.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export payment history
// @route   GET /api/payments/export
// @access  Private
const exportPaymentHistory = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [
        { from: req.user._id, fromModel: 'User' },
        { to: req.user._id, toModel: 'User' }
      ]
    })
    .populate('job', 'title')
    .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        'Date,Description,Amount,Status,Type,Transaction ID',
        ...transactions.map(t => 
          `${new Date(t.createdAt).toLocaleDateString()},${t.job.title},${t.amount},${t.status},${t.type},${t._id.toString().slice(-8).toUpperCase()}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payment-history.csv"');
      res.send(csv);
    } else {
      res.status(400).json({ message: 'Unsupported format' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPaymentHistory,
  getPaymentReceipt,
  getEscrowBalance,
  exportPaymentHistory
};