// backend/server.js (updated)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const domainRoutes = require('./routes/domainRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

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

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/transactions', transactionRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Freelance Marketplace API is running');
});

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a room based on user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle chat messages
  socket.on('sendMessage', async ({ chatId, message, sender, recipient }) => {
    io.to(recipient).emit('newMessage', {
      chatId,
      message,
      sender
    });
  });
  
  // Handle notifications
  socket.on('notification', (notification) => {
    io.to(notification.recipient).emit('newNotification', notification);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });