// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {
  createChat,
  getChatById,
  sendMessage,
  getUserChats,
  getArchivedChats,
  archiveChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createChat);
router.get('/', protect, getUserChats);
router.get('/archived', protect, getArchivedChats);
router.get('/:id', protect, getChatById);
router.post('/:id/messages', protect, sendMessage);
router.put('/:id/archive', protect, archiveChat);

module.exports = router;