// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

// Import routes
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const domainRoutes = require('./routes/domainRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const securityRoutes = require('./routes/securityRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Make io available to routes
app.set('io', io);

// Store online users and their socket information
const onlineUsers = new Map(); // userId -> { socketId, lastSeen, status, user }
const typingUsers = new Map(); // chatId -> Set of { userId, userName, startTime }
const userSockets = new Map(); // userId -> socketId for quick lookup

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ No token provided for socket connection');
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('-password')
      .lean();
    
    if (!user) {
      console.log('❌ User not found for token:', decoded.id);
      return next(new Error('Authentication error: User not found'));
    }

    // Check if user account is active


    socket.userId = user._id.toString();
    socket.user = user;
    
    console.log('✅ Socket authenticated for user:', user.name);
    next();
  } catch (error) {
    console.log('❌ Socket authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    return next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', async (socket) => {
  const userId = socket.userId;
  const user = socket.user;
  
  console.log(`🔌 User connected: ${user.name} (${userId}) - Socket ID: ${socket.id}`);
  
  // Check if user already has an active connection
  const existingSocketId = userSockets.get(userId);
  if (existingSocketId && existingSocketId !== socket.id) {
    const existingSocket = io.sockets.sockets.get(existingSocketId);
    if (existingSocket && existingSocket.connected) {
      console.log(`⚠️ User ${userId} already has active connection (${existingSocketId}), gracefully replacing...`);
      existingSocket.emit('force-disconnect', 'New connection established');
      existingSocket.disconnect(true);
      // Clean up the old socket from userSockets map
      userSockets.delete(userId);
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Store user socket mapping
  userSockets.set(userId, socket.id);
  
  // Add user to online users
  onlineUsers.set(userId, {
    socketId: socket.id,
    lastSeen: new Date(),
    status: 'online',
    user: {
      _id: userId,
      name: user.name,
      profilePicture: user.profilePicture
    }
  });
  
  // Join user to their personal notification room
  socket.join(`user_${userId}`);
  console.log(`📢 User ${userId} joined notification room`);
  
  // Broadcast that user is online (only if privacy settings allow)
  const showOnlineStatus = user.privacySettings?.activity?.showOnlineStatus !== false;
  if (showOnlineStatus) {
    socket.broadcast.emit('user-online', userId);
    console.log(`🟢 Broadcasting user ${userId} is online`);
  }
  
  // Send current online users list to the connected user
  const onlineUserIds = Array.from(onlineUsers.keys()).filter(id => {
    const userInfo = onlineUsers.get(id);
    return userInfo && userInfo.user;
  });
  socket.emit('online-users-list', onlineUserIds);
  console.log(`📋 Sent online users list to ${userId}:`, onlineUserIds.length, 'users');
  
  // Handle joining user's general room (legacy support)
  socket.on('join', (joinUserId) => {
    if (joinUserId === userId) {
      socket.join(joinUserId);
      console.log(`🏠 User ${joinUserId} joined their general room`);
    }
  });
  
  // Handle joining specific chat rooms
  socket.on('join-chat', async (chatId) => {
    try {
      // Verify user has access to this chat
      const { Chat } = require('./models');
      const chat = await Chat.findById(chatId).lean();
      
      if (chat && (
        chat.employer.toString() === userId ||
        chat.freelancer.toString() === userId
      )) {
        socket.join(`chat_${chatId}`);
        console.log(`💬 User ${userId} joined chat room: ${chatId}`);
        
        // Update user's last seen in this chat (asynchronously)
        Chat.findById(chatId)
          .then(fullChat => {
            if (fullChat) {
              fullChat.updateLastSeen(userId);
              return fullChat.save();
            }
          })
          .catch(error => {
            console.error('❌ Error updating last seen:', error);
          });
      } else {
        console.log(`❌ User ${userId} denied access to chat ${chatId}`);
        socket.emit('error', { message: 'Access denied to chat room' });
      }
    } catch (error) {
      console.error('❌ Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat room' });
    }
  });
  
  // Handle leaving specific chat rooms
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`🚪 User ${userId} left chat room: ${chatId}`);
    
    // Stop typing in this chat
    const chatTypingUsers = typingUsers.get(chatId);
    if (chatTypingUsers) {
      // Find and remove user from typing list
      const userTyping = Array.from(chatTypingUsers).find(t => t.userId === userId);
      if (userTyping) {
        chatTypingUsers.delete(userTyping);
        
        // Notify others that user stopped typing
        socket.to(`chat_${chatId}`).emit('typing-stop', {
          chatId,
          userId
        });
        
        console.log(`⌨️ User ${userId} stopped typing in chat ${chatId} (left room)`);
      }
      
      if (chatTypingUsers.size === 0) {
        typingUsers.delete(chatId);
      }
    }
  });
  
  // Handle chat messages
  socket.on('sendMessage', async ({ chatId, message, sender, recipient }) => {
    try {
      console.log(`📤 Processing message in chat ${chatId} from ${sender} to ${recipient}`);
      
      // Verify sender is the authenticated user
      if (sender !== userId) {
        console.log(`❌ User ${userId} attempted to send message as ${sender}`);
        socket.emit('error', { message: 'Invalid sender' });
        return;
      }
      
      // Emit to the specific chat room
      io.to(`chat_${chatId}`).emit('newMessage', {
        chatId,
        message,
        sender
      });
      
      // Also send to recipient's personal room for notifications
      io.to(`user_${recipient}`).emit('newMessage', {
        chatId,
        message,
        sender
      });
      
      // Send to legacy room format as well
      io.to(recipient).emit('newMessage', {
        chatId,
        message,
        sender
      });
      
      console.log(`✅ Message delivered in chat ${chatId} from ${sender} to ${recipient}`);
    } catch (error) {
      console.error('❌ Error handling sendMessage:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing-start', ({ chatId, userId: typingUserId, userName }) => {
    try {
      // Verify typing user is the authenticated user
      if (typingUserId !== userId) {
        console.log(`❌ User ${userId} attempted to start typing as ${typingUserId}`);
        return;
      }
      
      // Add user to typing users for this chat
      if (!typingUsers.has(chatId)) {
        typingUsers.set(chatId, new Set());
      }
      
      const chatTypingUsers = typingUsers.get(chatId);
      
      // Remove any existing entry for this user
      const existingEntry = Array.from(chatTypingUsers).find(t => t.userId === userId);
      if (existingEntry) {
        chatTypingUsers.delete(existingEntry);
      }
      
      // Add new entry
      chatTypingUsers.add({
        userId,
        userName: userName || user.name,
        startTime: new Date()
      });
      
      // Broadcast to others in the chat (except sender)
      socket.to(`chat_${chatId}`).emit('typing-start', {
        chatId,
        userId,
        userName: userName || user.name
      });
      
      console.log(`⌨️ User ${userName || user.name} started typing in chat ${chatId}`);
    } catch (error) {
      console.error('❌ Error handling typing-start:', error);
    }
  });

  socket.on('typing-stop', ({ chatId, userId: typingUserId }) => {
    try {
      // Verify typing user is the authenticated user
      if (typingUserId !== userId) {
        console.log(`❌ User ${userId} attempted to stop typing as ${typingUserId}`);
        return;
      }
      
      // Remove user from typing users for this chat
      const chatTypingUsers = typingUsers.get(chatId);
      if (chatTypingUsers) {
        const userTyping = Array.from(chatTypingUsers).find(t => t.userId === userId);
        if (userTyping) {
          chatTypingUsers.delete(userTyping);
          
          if (chatTypingUsers.size === 0) {
            typingUsers.delete(chatId);
          }
        }
      }
      
      // Broadcast to others in the chat (except sender)
      socket.to(`chat_${chatId}`).emit('typing-stop', {
        chatId,
        userId
      });
      
      console.log(`⌨️ User ${userId} stopped typing in chat ${chatId}`);
    } catch (error) {
      console.error('❌ Error handling typing-stop:', error);
    }
  });

  // Handle message read receipts
  socket.on('mark-messages-read', async ({ chatId }) => {
    try {
      const { Chat } = require('./models');
      const chat = await Chat.findById(chatId);
      
      if (chat && (
        chat.employer.toString() === userId ||
        chat.freelancer.toString() === userId
      )) {
        // Update last seen
        chat.updateLastSeen(userId);
        await chat.save();
        
        // Notify others in the chat
        socket.to(`chat_${chatId}`).emit('messages-read', {
          chatId,
          readBy: userId,
          readAt: new Date()
        });
        
        console.log(`📖 Messages marked as read in chat ${chatId} by user ${userId}`);
      } else {
        console.log(`❌ User ${userId} denied access to mark messages read in chat ${chatId}`);
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });
  
  // Handle notification events
  socket.on('join-notifications', (joinUserId) => {
    if (joinUserId === userId) {
      socket.join(`user_${joinUserId}`);
      console.log(`🔔 User ${joinUserId} joined notification room`);
    }
  });

  socket.on('mark-notification-read', async (notificationId) => {
    try {
      const { Notification } = require('./models');
      const notification = await Notification.findById(notificationId);
      
      // Verify user owns this notification
      if (notification && notification.recipient.toString() === userId) {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        
        // Emit to user's room that notification was read
        io.to(`user_${userId}`).emit('notification-read', notificationId);
        console.log(`🔔 Notification ${notificationId} marked as read by user ${userId}`);
      } else {
        console.log(`❌ User ${userId} attempted to mark notification ${notificationId} as read`);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  socket.on('mark-all-notifications-read', async () => {
    try {
      const { Notification } = require('./models');
      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );
      
      // Emit to user's room that all notifications were read
      io.to(`user_${userId}`).emit('notifications-cleared');
      console.log(`🔔 All notifications marked as read for user ${userId}`);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      socket.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  });
  
  // Handle request for online users list
  socket.on('get-online-users', () => {
    const onlineUserIds = Array.from(onlineUsers.keys()).filter(id => {
      const userInfo = onlineUsers.get(id);
      return userInfo && userInfo.user;
    });
    socket.emit('online-users-list', onlineUserIds);
    console.log(`📋 Sent online users list to ${userId}: ${onlineUserIds.length} users`);
  });
  
  // Handle user status update
  socket.on('update-status', ({ status }) => {
    const validStatuses = ['online', 'away', 'busy', 'invisible'];
    if (!validStatuses.includes(status)) {
      console.log(`❌ Invalid status ${status} from user ${userId}`);
      return;
    }
    
    const userInfo = onlineUsers.get(userId);
    if (userInfo) {
      userInfo.status = status;
      userInfo.lastSeen = new Date();
      onlineUsers.set(userId, userInfo);
      
      // Broadcast status update (only if privacy settings allow)
      const showOnlineStatus = user.privacySettings?.activity?.showOnlineStatus !== false;
      if (showOnlineStatus) {
        socket.broadcast.emit('user-status-changed', {
          userId,
          status,
          lastSeen: userInfo.lastSeen
        });
        console.log(`🔄 User ${userId} status updated to ${status}`);
      }
    }
  });
  
  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
    
    // Update last seen
    const userInfo = onlineUsers.get(userId);
    if (userInfo) {
      userInfo.lastSeen = new Date();
      onlineUsers.set(userId, userInfo);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${user.name} (${userId}) - Socket ID: ${socket.id} - Reason: ${reason}`);
    
    // Only clean up if this is the current socket for the user
    const currentSocketId = userSockets.get(userId);
    if (currentSocketId === socket.id) {
      console.log(`🧹 Cleaning up connection for user ${userId}`);
      
      // Update user's last seen and remove from online users
      const userInfo = onlineUsers.get(userId);
      if (userInfo) {
        userInfo.lastSeen = new Date();
        userInfo.status = 'offline';
      }
      
      // Remove user from online users and socket mapping
      onlineUsers.delete(userId);
      userSockets.delete(userId);
    
    // Remove user from all typing indicators
    for (const [chatId, chatTypingUsers] of typingUsers.entries()) {
      const userTyping = Array.from(chatTypingUsers).find(t => t.userId === userId);
      if (userTyping) {
        chatTypingUsers.delete(userTyping);
        
        // Notify others that user stopped typing
        socket.to(`chat_${chatId}`).emit('typing-stop', {
          chatId,
          userId
        });
        
        console.log(`⌨️ User ${userId} stopped typing in chat ${chatId} (disconnected)`);
        
        if (chatTypingUsers.size === 0) {
          typingUsers.delete(chatId);
        }
      }
    }
    
      // Broadcast that user is offline (only if privacy settings allow)
      const showOnlineStatus = user.privacySettings?.activity?.showOnlineStatus !== false;
      if (showOnlineStatus) {
        socket.broadcast.emit('user-offline', userId);
        console.log(`🔴 Broadcasting user ${userId} is offline`);
      }
    } else {
      console.log(`⚠️ Socket ${socket.id} disconnected but was not the current socket for user ${userId}`);
    }
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for user ${userId}:`, error);
  });
});

// Handle server-level socket errors
io.on('error', (error) => {
  console.error('❌ Socket.io server error:', error);
});

// Cleanup function for stale typing indicators (run every 2 minutes)
const cleanupTypingIndicators = () => {
  const now = new Date();
  const TYPING_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  
  for (const [chatId, chatTypingUsers] of typingUsers.entries()) {
    const usersToRemove = [];
    
    for (const typingUser of chatTypingUsers) {
      if ((now - typingUser.startTime) > TYPING_TIMEOUT) {
        usersToRemove.push(typingUser);
      }
    }
    
    // Remove stale typing indicators
    for (const typingUser of usersToRemove) {
      chatTypingUsers.delete(typingUser);
      
      // Notify others that user stopped typing
      io.to(`chat_${chatId}`).emit('typing-stop', {
        chatId,
        userId: typingUser.userId
      });
      
      console.log(`🧹 Cleaned up stale typing indicator for user ${typingUser.userId} in chat ${chatId}`);
    }
    
    if (chatTypingUsers.size === 0) {
      typingUsers.delete(chatId);
    }
  }
};

// Cleanup function for stale online users (run every 10 minutes)
const cleanupOnlineUsers = () => {
  const now = new Date();
  const OFFLINE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  
  for (const [userId, userInfo] of onlineUsers.entries()) {
    if ((now - userInfo.lastSeen) > OFFLINE_TIMEOUT) {
      console.log(`🧹 Cleaning up stale online user: ${userId}`);
      onlineUsers.delete(userId);
      userSockets.delete(userId);
      
      // Broadcast that user is offline
      io.emit('user-offline', userId);
    }
  }
};

// Set up cleanup intervals
setInterval(cleanupTypingIndicators, 2 * 60 * 1000); // Every 2 minutes
setInterval(cleanupOnlineUsers, 10 * 60 * 1000); // Every 10 minutes

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/security', securityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    onlineUsers: onlineUsers.size,
    activeChats: typingUsers.size
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Nexara Freelance Marketplace API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Socket status endpoint for debugging
app.get('/api/socket/status', (req, res) => {
  res.json({
    onlineUsers: Array.from(onlineUsers.keys()),
    typingChats: Array.from(typingUsers.keys()),
    connectedSockets: io.sockets.sockets.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Database connection and server startup
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📡 Socket.io server ready for connections`);
      console.log(`🔔 Real-time features enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  server.close(() => {
    console.log('🔌 HTTP server closed');
    
    // Close Socket.io server
    io.close(() => {
      console.log('📡 Socket.io server closed');
      
      // Close database connection
      mongoose.connection.close(false, () => {
        console.log('💾 MongoDB connection closed');
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
    });
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  // Close server gracefully
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  // Close server gracefully
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
startServer();

// Export for testing
module.exports = { app, io, server };