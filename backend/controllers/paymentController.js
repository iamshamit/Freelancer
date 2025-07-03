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
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'employer') {
      // Employers see their outgoing payments (money they spent)
      query = {
        from: userId,
        fromModel: 'User'
      };
    } else if (req.user.role === 'freelancer') {
      // Freelancers see their incoming payments (money they earned)
      query = {
        to: userId,
        toModel: 'User'
      };
    } else {
      // Admin or other roles see all transactions they're involved in
      query = {
        $or: [
          { from: userId, fromModel: 'User' },
          { to: userId, toModel: 'User' }
        ]
      };
    }

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

    // Transform transactions for frontend with role-specific data
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

      // Role-specific description
      let description = '';
      if (req.user.role === 'employer') {
        description = `Payment to ${job.freelancer?.name || 'freelancer'} for ${job.title}`;
      } else if (req.user.role === 'freelancer') {
        description = `Payment from ${job.employer?.name || 'client'} for ${job.title}`;
      } else {
        description = `Payment for ${job.title}`;
      }

      return {
        _id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        date: transaction.createdAt,
        description,
        milestoneTitle,
        transactionId: transaction._id.toString().slice(-8).toUpperCase(),
        type: transaction.type,
        job: {
          _id: job._id,
          title: job.title,
          employer: job.employer?.name,
          freelancer: job.freelancer?.name
        },
        from: transaction.from,
        to: transaction.to
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
        select: 'name email',
        refPath: 'fromModel'
      })
      .populate({
        path: 'to',
        select: 'name email',
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

    // Get job details for receipt
    const job = await Job.findById(transaction.job).populate('employer freelancer');

    // Generate enhanced PDF receipt
    const doc = new PDFDocument({ margin: 50 });
    const filename = `receipt-${transaction._id.toString().slice(-8)}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF to response
    doc.pipe(res);

    // Header with logo area (you can add actual logo later)
    doc.fontSize(24)
       .fillColor('#f97316')
       .text('Payment Receipt', { align: 'center' });
    
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('FreelanceHub Platform', { align: 'center' })
       .text('support@freelancehub.com', { align: 'center' });
    
    doc.moveDown(2);

    // Receipt header info
    doc.fontSize(12).fillColor('#000000');
    const receiptId = transaction._id.toString().slice(-8).toUpperCase();
    
    // Create a two-column layout for receipt info
    const leftColumn = 50;
    const rightColumn = 350;
    
    doc.text('Receipt Details', leftColumn, doc.y, { underline: true, width: 200 });
    doc.text('Transaction Info', rightColumn, doc.y - 15, { underline: true, width: 200 });
    
    doc.moveDown(0.5);
    
    // Left column - Receipt details
    const receiptDetailsY = doc.y;
    doc.text(`Receipt #: ${receiptId}`, leftColumn)
       .text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`)
       .text(`Time: ${new Date(transaction.createdAt).toLocaleTimeString()}`);
    
    // Right column - Transaction details
    doc.text(`Amount: $${transaction.amount.toFixed(2)}`, rightColumn, receiptDetailsY)
       .text(`Status: ${transaction.status.toUpperCase()}`)
       .text(`Type: ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`);
    
    doc.moveDown(2);
    
    // Project information
    doc.fontSize(14).text('Project Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
       .text(`Project: ${job.title}`)
       .text(`Project ID: ${job._id.toString().slice(-8).toUpperCase()}`);
    
    if (transaction.percentage) {
      const milestone = await Milestone.findOne({
        job: transaction.job,
        percentage: transaction.percentage
      });
      doc.text(`Milestone: ${milestone ? milestone.title : `${transaction.percentage}% Complete`}`);
    }
    
    doc.moveDown(1.5);
    
    // Parties involved
    doc.fontSize(14).text('Transaction Parties', { underline: true });
    doc.moveDown(0.5);
    
    // Determine user roles for display
    const isUserEmployer = req.user.role === 'employer';
    const isUserFreelancer = req.user.role === 'freelancer';
    
    doc.fontSize(12);
    if (isUserEmployer) {
      doc.text(`Client (You): ${transaction.from.name}`)
         .text(`Email: ${transaction.from.email}`)
         .moveDown(0.5)
         .text(`Freelancer: ${transaction.to.name}`)
         .text(`Email: ${transaction.to.email}`);
    } else if (isUserFreelancer) {
      doc.text(`Freelancer (You): ${transaction.to.name}`)
         .text(`Email: ${transaction.to.email}`)
         .moveDown(0.5)
         .text(`Client: ${transaction.from.name}`)
         .text(`Email: ${transaction.from.email}`);
    } else {
      doc.text(`From: ${transaction.from.name} (${transaction.from.email})`)
         .text(`To: ${transaction.to.name} (${transaction.to.email})`);
    }
    
    doc.moveDown(2);
    
    // Payment summary box
    const boxY = doc.y;
    doc.rect(leftColumn, boxY, 500, 60)
       .strokeColor('#e5e7eb')
       .stroke();
    
    doc.fontSize(14)
       .fillColor('#374151')
       .text('Payment Summary', leftColumn + 20, boxY + 15);
    
    doc.fontSize(18)
       .fillColor('#059669')
       .text(`$${transaction.amount.toFixed(2)}`, rightColumn + 50, boxY + 15);
    
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Transaction ID: ${receiptId}`, leftColumn + 20, boxY + 40);
    
    doc.moveDown(4);
    
    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('This is an official receipt for the transaction completed on FreelanceHub platform.', 
             { align: 'center', y: footerY })
       .text('For support or questions, please contact support@freelancehub.com', 
             { align: 'center' })
       .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 
             { align: 'center' });

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
    const { format = 'csv', dateRange, status, userRole } = req.query;
    const userId = req.user._id;
    
    // Build query based on user role (same logic as getPaymentHistory)
    let query = {};
    
    if (req.user.role === 'employer') {
      query = {
        from: userId,
        fromModel: 'User'
      };
    } else if (req.user.role === 'freelancer') {
      query = {
        to: userId,
        toModel: 'User'
      };
    } else {
      query = {
        $or: [
          { from: userId, fromModel: 'User' },
          { to: userId, toModel: 'User' }
        ]
      };
    }

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

    if (format === 'csv') {
      // Role-specific CSV headers
      let csvHeaders = [];
      
      if (req.user.role === 'employer') {
        csvHeaders = [
          'Date',
          'Project Title',
          'Freelancer',
          'Amount Paid',
          'Status',
          'Payment Type',
          'Transaction ID',
          'Milestone',
          'Freelancer Email'
        ];
      } else if (req.user.role === 'freelancer') {
        csvHeaders = [
          'Date',
          'Project Title',
          'Client',
          'Amount Earned',
          'Status',
          'Payment Type',
          'Transaction ID',
          'Milestone',
          'Client Email'
        ];
      } else {
        csvHeaders = [
          'Date',
          'Project Title',
          'Description',
          'Amount',
          'Status',
          'Type',
          'Transaction ID',
          'From',
          'To',
          'Milestone'
        ];
      }

      const csvRows = await Promise.all(transactions.map(async (t) => {
        // Get milestone info if available
        let milestoneInfo = '';
        if (t.percentage) {
          const milestone = await Milestone.findOne({
            job: t.job._id,
            percentage: t.percentage
          });
          milestoneInfo = milestone ? milestone.title : `${t.percentage}% Milestone`;
        }

        // Get job details
        const job = await Job.findById(t.job._id).populate('employer freelancer');

        // Role-specific row data
        if (req.user.role === 'employer') {
          return [
            new Date(t.createdAt).toLocaleDateString(),
            `"${t.job.title}"`,
            `"${t.to.name}"`,
            t.amount,
            t.status,
            t.type,
            t._id.toString().slice(-8).toUpperCase(),
            `"${milestoneInfo}"`,
            `"${t.to.email}"`
          ].join(',');
        } else if (req.user.role === 'freelancer') {
          return [
            new Date(t.createdAt).toLocaleDateString(),
            `"${t.job.title}"`,
            `"${t.from.name}"`,
            t.amount,
            t.status,
            t.type,
            t._id.toString().slice(-8).toUpperCase(),
            `"${milestoneInfo}"`,
            `"${t.from.email}"`
          ].join(',');
        } else {
          return [
            new Date(t.createdAt).toLocaleDateString(),
            `"${t.job.title}"`,
            `"Payment for ${t.job.title}"`,
            t.amount,
            t.status,
            t.type,
            t._id.toString().slice(-8).toUpperCase(),
            `"${t.from.name}"`,
            `"${t.to.name}"`,
            `"${milestoneInfo}"`
          ].join(',');
        }
      }));

      const csv = [csvHeaders.join(','), ...csvRows].join('\n');
      
      // Role-specific filename
      const rolePrefix = req.user.role === 'employer' ? 'expenses' : 
                        req.user.role === 'freelancer' ? 'earnings' : 'payments';
      const filename = `${rolePrefix}-history-${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } else {
      res.status(400).json({ message: 'Unsupported format' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction details
// @route   GET /api/payments/transaction/:transactionId
// @access  Private
const getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('job')
      .populate({
        path: 'from',
        select: 'name email',
        refPath: 'fromModel'
      })
      .populate({
        path: 'to',
        select: 'name email',
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

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPaymentHistory,
  getPaymentReceipt,
  getEscrowBalance,
  exportPaymentHistory,
  getTransactionDetails
};