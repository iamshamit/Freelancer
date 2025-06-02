// backend/controllers/chatController.js
const { Chat, Job, Notification } = require('../models');

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is either the employer or the freelancer
    if (
      job.employer.toString() !== req.user._id.toString() &&
      job.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      job: jobId,
      employer: job.employer,
      freelancer: job.freelancer
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const chat = await Chat.create({
      job: jobId,
      employer: job.employer,
      freelancer: job.freelancer,
      messages: []
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('job', 'title status')
      .populate('employer', 'name profilePicture')
      .populate('freelancer', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is either the employer or the freelancer
    if (
      chat.employer._id.toString() !== req.user._id.toString() &&
      chat.freelancer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a message
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    console.log('SendMessage request:', { chatId: req.params.id, content, userId: req.user._id });

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is either the employer or the freelancer
    if (
      chat.employer.toString() !== req.user._id.toString() &&
      chat.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add message
    const message = {
      sender: req.user._id,
      content: content.trim(),
      timestamp: Date.now()
    };

    chat.messages.push(message);
    await chat.save();

    console.log('Message saved successfully:', message);

    // Determine recipient
    const recipient = chat.employer.toString() === req.user._id.toString()
      ? chat.freelancer
      : chat.employer;

    // Create notification
    await Notification.create({
      recipient,
      sender: req.user._id,
      type: 'new_message',
      chat: chat._id,
      job: chat.job,
      message: 'You have a new message'
    });

    // Populate sender info for the response
    const populatedMessage = {
      ...message,
      sender: {
        _id: req.user._id,
        name: req.user.name,
        profilePicture: req.user.profilePicture
      }
    };

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { employer: req.user._id },
        { freelancer: req.user._id }
      ],
      isArchived: false
    })
      .populate('job', 'title status')
      .populate('employer', 'name profilePicture')
      .populate('freelancer', 'name profilePicture')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get archived chats
// @route   GET /api/chats/archived
// @access  Private
const getArchivedChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { employer: req.user._id },
        { freelancer: req.user._id }
      ],
      isArchived: true
    })
      .populate('job', 'title status')
      .populate('employer', 'name profilePicture')
      .populate('freelancer', 'name profilePicture')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Archive a chat
// @route   PUT /api/chats/:id/archive
// @access  Private
const archiveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is either the employer or the freelancer
    if (
      chat.employer.toString() !== req.user._id.toString() &&
      chat.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    chat.isArchived = true;
    await chat.save();

    res.json({ message: 'Chat archived successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createChat,
  getChatById,
  sendMessage,
  getUserChats,
  getArchivedChats,
  archiveChat
};