// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('./models'); // Assuming you have an index.js in models

const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const domainRoutes = require('./routes/domainRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make io available to routes
app.set('io', io);

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.log('Socket authentication error:', error.message);
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.userId})`);
  
  // Join user to their personal room for notifications
  socket.join(`user_${socket.userId}`);
  console.log(`User ${socket.userId} joined notification room`);
  
  // Handle joining chat rooms
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their chat room`);
  });
  
  // Handle chat messages
  socket.on('sendMessage', async ({ chatId, message, sender, recipient }) => {
    io.to(recipient).emit('newMessage', {
      chatId,
      message,
      sender
    });
  });
  
  // Handle notification events
  socket.on('join-notifications', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined notification room`);
  });

  socket.on('mark-notification-read', async (notificationId) => {
    try {
      const { Notification } = require('./models');
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      
      // Emit to user's room that notification was read
      io.to(`user_${socket.userId}`).emit('notification-read', notificationId);
      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  socket.on('mark-all-notifications-read', async () => {
    try {
      const { Notification } = require('./models');
      await Notification.updateMany(
        { recipient: socket.userId, read: false },
        { read: true }
      );
      
      // Emit to user's room that all notifications were read
      io.to(`user_${socket.userId}`).emit('notifications-cleared');
      console.log(`All notifications marked as read for user ${socket.userId}`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  });
  
  // Handle generic notifications
  socket.on('notification', (notification) => {
    io.to(`user_${notification.recipient}`).emit('newNotification', notification);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/search', searchRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Freelance Marketplace API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.io server ready for connections`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, io };