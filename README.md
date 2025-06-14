# Freelance Marketplace Platform

A comprehensive full-stack freelance marketplace platform that connects employers with skilled freelancers. Built with modern web technologies, this platform provides a complete solution for project-based work management, secure payments, real-time communication, and professional networking.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Freelancers, Employers, Admins)
- **Job Posting & Bidding**: Comprehensive job creation and application system
- **Real-time Chat**: WebSocket-powered messaging with typing indicators
- **Milestone-based Payments**: Secure escrow system with milestone tracking
- **Rating & Review System**: Comprehensive feedback mechanism
- **Advanced Search**: Full-text search with filters for jobs and freelancers
- **File Management**: Secure file upload and sharing capabilities

### Advanced Features
- **Two-Factor Authentication**: Enhanced security with TOTP support
- **Privacy Controls**: Granular privacy settings for user profiles
- **Notification System**: Multi-channel notifications (email, push, in-app)
- **Payment Integration**: Secure transaction processing
- **Admin Dashboard**: Administrative controls and analytics
- **Profile Verification**: User verification system
- **Domain Categorization**: Organized job categories and skills

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: System-wide dark/light theme toggle
- **Interactive Animations**: Smooth transitions with Framer Motion
- **Real-time Updates**: Live data synchronization
- **Progressive Web App**: Offline capabilities and native app experience

## 🛠 Tech Stack

### Frontend
- **React 19** - Latest React features with concurrent rendering
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Advanced animations and transitions
- **React Router DOM** - Client-side routing
- **React Query (TanStack)** - Server state management
- **Socket.io Client** - Real-time communication
- **Formik + Yup** - Form handling and validation
- **Three.js** - 3D graphics and visualizations
- **Lucide React** - Beautiful icon set

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **PDFKit** - PDF generation
- **QR Code** - QR code generation
- **Speakeasy** - Two-factor authentication

### Development Tools
- **ESLint** - Code linting and formatting
- **Nodemon** - Development server auto-restart
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
Freelance/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   │   ├── User.js      # User model with roles and settings
│   │   ├── Job.js       # Job posting model
│   │   ├── Chat.js      # Chat/messaging model
│   │   ├── Milestone.js # Payment milestone model
│   │   ├── Transaction.js # Transaction records
│   │   └── ...
│   ├── routes/          # API routes
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── chatRoutes.js
│   │   └── ...
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   │   ├── auth/    # Authentication components
│   │   │   ├── chat/    # Chat/messaging components
│   │   │   ├── common/  # Shared components
│   │   │   ├── forms/   # Form components
│   │   │   └── layout/  # Layout components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   ├── jobs/        # Job-related pages
│   │   │   ├── chat/        # Chat pages
│   │   │   ├── profile/     # Profile pages
│   │   │   └── settings/    # Settings pages
│   │   ├── services/    # API service functions
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Freelance
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Create backend environment file**
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/freelance-marketplace

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload (optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

4. **Frontend Setup**
```bash
cd ../frontend
npm install
```

5. **Create frontend environment file**
```bash
cp .env.example .env
```

Configure your frontend `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Start the backend server**
```bash
cd backend
npm run dev
```

3. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Seeding Data (Optional)

To populate the database with sample data:
```bash
cd backend
npm run seed
```

## 🔐 Authentication & Authorization

The platform implements a comprehensive authentication system:

- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Three user roles (Freelancer, Employer, Admin)
- **Two-Factor Authentication**: Optional TOTP-based 2FA
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Automatic token refresh and logout

### User Roles

- **Freelancers**: Can browse jobs, submit applications, communicate with employers, manage milestones
- **Employers**: Can post jobs, review applications, hire freelancers, manage projects
- **Admins**: Full platform management capabilities

## 💬 Real-time Features

### Chat System
- Real-time messaging with Socket.io
- Typing indicators and read receipts
- File sharing capabilities
- Message history and search
- Chat archiving functionality

### Notifications
- Real-time in-app notifications
- Email notifications (configurable)
- Push notifications support
- Notification preferences management

## 💰 Payment System

### Milestone-based Payments
- Secure escrow system
- Project milestone tracking
- Automated payment release
- Transaction history
- Dispute resolution support

### Features
- Payment method management
- Invoice generation
- Tax calculation support
- Refund processing

## 🔍 Search & Discovery

### Advanced Search
- Full-text search across jobs and profiles
- Filter by skills, budget, location, rating
- Saved searches and search history
- Smart recommendations
- Freelancer directory

## ⚙️ Configuration

### Privacy Settings
Users can control:
- Profile visibility
- Contact information display
- Activity status
- Search appearance
- Data usage preferences

### Security Settings
- Two-factor authentication
- Login notifications
- Unusual activity alerts
- Account recovery options

## 📱 API Documentation

### Authentication Endpoints
```
POST /api/users/register     # User registration
POST /api/users/login        # User login
POST /api/users/logout       # User logout
GET  /api/users/profile      # Get user profile
PUT  /api/users/profile      # Update user profile
```

### Job Endpoints
```
GET    /api/jobs             # Get all jobs
POST   /api/jobs             # Create new job
GET    /api/jobs/:id         # Get job by ID
PUT    /api/jobs/:id         # Update job
DELETE /api/jobs/:id         # Delete job
POST   /api/jobs/:id/apply   # Apply to job
```

### Chat Endpoints
```
GET  /api/chats              # Get user chats
POST /api/chats              # Create new chat
GET  /api/chats/:id          # Get chat messages
POST /api/chats/:id/message  # Send message
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for models and utilities
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# The build files will be in the dist/ directory
```

### Environment Variables (Production)
Ensure all environment variables are properly configured for production:
- Database connection strings
- JWT secrets (use strong, unique keys)
- CORS origins
- File upload paths
- Email service configuration

### Recommended Deployment Platforms
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **File Storage**: AWS S3, Cloudinary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing problems
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Video calling integration
- [ ] AI-powered job matching
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Blockchain-based payments
- [ ] Advanced dispute resolution
- [ ] Team collaboration features

### Performance Improvements
- [ ] Database query optimization
- [ ] Caching implementation (Redis)
- [ ] CDN integration
- [ ] Image optimization
- [ ] Lazy loading enhancements

---

**Built with ❤️ by Shamit**

For more information, visit our [documentation](docs/) or contact our [support team](mailto:support@freelancemarketplace.com).