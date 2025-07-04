# Nexara - Freelance Marketplace Platform

A comprehensive, full-stack freelance marketplace application that connects skilled freelancers with employers seeking quality services. Built with modern web technologies and featuring real-time communication, secure payments, and robust project management capabilities.

## 🚀 Features

### Core Functionality

- **User Authentication & Authorization**

  - JWT-based authentication with role-based access control
  - Two-factor authentication (2FA) with backup codes
  - Secure password hashing using bcrypt
  - Multiple user roles: Freelancer, Employer, Admin

- **Job Management**

  - Create, edit, and manage job postings
  - Job categorization by domains/skills
  - Application system for freelancers
  - Job status tracking (open, assigned, completed, cancelled)
  - Employer job dashboard with applicant management

- **Real-time Communication**

  - Socket.io-powered real-time chat system
  - Online status tracking
  - Typing indicators
  - Message archiving
  - Heartbeat system for connection monitoring

- **Milestone & Payment System**

  - Project milestone management
  - Escrow-based payment protection
  - Payment history tracking
  - Transaction management
  - PDF receipt generation

- **Search & Discovery**

  - Global search functionality
  - Freelancer directory
  - Advanced filtering options
  - Search suggestions
  - Saved searches
  - Recommendation system

- **Notification System**

  - Real-time notifications
  - Email notifications
  - Notification preferences
  - Category-based notifications
  - Mark as read/unread functionality

- **Rating & Review System**

  - Freelancer rating system
  - Review management
  - Rating aggregation

- **Admin Panel**

  - User management
  - Job moderation
  - System activity monitoring
  - Dashboard analytics
  - User status management

- **Security & Privacy**
  - Privacy settings management
  - Account security controls
  - Password change functionality
  - Account deletion
  - Security audit logs

### Advanced Features

- **File Upload System** - Profile pictures and document uploads
- **QR Code Generation** - For 2FA setup
- **PDF Generation** - For receipts and reports
- **Image Processing** - Profile picture optimization
- **Email Integration** - Automated email notifications
- **Recommendation Engine** - AI-powered job/freelancer matching

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Security**: bcryptjs, speakeasy (2FA)
- **PDF Generation**: PDFKit
- **QR Codes**: qrcode
- **HTTP Client**: Axios
- **Environment**: dotenv
- **CORS**: cors middleware

### Frontend

- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Form Handling**: Formik with Yup validation
- **Animations**: Framer Motion, GSAP
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Data Fetching**: TanStack React Query
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **3D Graphics**: Three.js with React Three Fiber
- **Utilities**: date-fns, react-scroll, react-intersection-observer

### DevOps & Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Development**: nodemon (backend), Vite HMR (frontend)
- **Code Quality**: ESLint
- **Build System**: Vite
- **Environment Variables**: .env files

## 📁 Project Structure

```
Freelance/
├── backend/
│   ├── config/
│   │   └── jwt.js                 # JWT configuration
│   ├── controllers/               # Business logic controllers
│   ├── middleware/               # Custom middleware
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Chat.js
│   │   ├── Notification.js
│   │   ├── Domain.js
│   │   ├── Milestone.js
│   │   ├── Transaction.js
│   │   ├── Escrow.js
│   │   ├── Admin.js
│   │   └── index.js
│   ├── routes/                   # API routes
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── domainRoutes.js
│   │   ├── milestoneRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── securityRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/                    # Utility functions
│   │   ├── imageUpload.js
│   │   ├── notificationHelper.js
│   │   ├── recommendationService.js
│   │   ├── transactionHelpers.js
│   │   └── seedData.js
│   ├── package.json
│   └── server.js                 # Main server file
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/               # Static assets
│   │   ├── components/           # Reusable components
│   │   │   ├── admin/
│   │   │   ├── applications/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── common/
│   │   │   ├── debug/
│   │   │   ├── jobs/
│   │   │   ├── layout/
│   │   │   ├── milestones/
│   │   │   ├── notifications/
│   │   │   ├── payments/
│   │   │   ├── profile/
│   │   │   ├── ratings/
│   │   │   ├── search/
│   │   │   └── test/
│   │   ├── context/              # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ChatContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useOnlineStatus.js
│   │   │   └── useRealTimeNotifications.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── admin/
│   │   │   ├── applicants/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── dashboard/
│   │   │   ├── employer/
│   │   │   ├── jobs/
│   │   │   ├── milestones/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── ratings/
│   │   │   ├── search/
│   │   │   ├── settings/
│   │   │   └── LandingPage.jsx
│   │   ├── services/
│   │   │   └── api.js             # API service layer
│   │   ├── utils/                # Utility functions
│   │   ├── App.jsx               # Main App component
│   │   ├── App.css
│   │   ├── main.jsx              # App entry point
│   │   └── index.css
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Freelance
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Environment Setup**

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/freelance-marketplace

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (if using email notifications)
EMAIL_FROM=your-email@example.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

5. **Start the application**

Backend:

```bash
cd backend
npm run dev
```

Frontend (in a new terminal):

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Job Endpoints

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/:id/apply` - Apply for a job
- `PUT /api/jobs/:jobId/select/:freelancerId` - Select freelancer

### Chat Endpoints

- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get chat by ID
- `POST /api/chats/:id/messages` - Send message

### Notification Endpoints

- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin Endpoints

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status

## 🗄️ Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['freelancer', 'employer', 'admin'],
  profilePicture: String,
  bio: String,
  skills: [String],
  ratings: [{
    rating: Number,
    review: String,
    from: ObjectId
  }],
  twoFactorSecret: String,
  twoFactorEnabled: Boolean,
  backupCodes: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model

```javascript
{
  title: String,
  description: String,
  domain: ObjectId (ref: Domain),
  budget: Number,
  employer: ObjectId (ref: User),
  status: ['open', 'assigned', 'completed', 'cancelled'],
  freelancer: ObjectId (ref: User),
  applicants: [{
    freelancer: ObjectId (ref: User),
    appliedAt: Date
  }],
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    status: String,
    dueDate: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run test` - Run admin tests
- `npm run debug` - Run debug utilities

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Two-Factor Authentication** - TOTP-based 2FA with backup codes
- **Role-Based Access Control** - Different permissions for different user types
- **CORS Protection** - Configured CORS for secure cross-origin requests
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - MongoDB injection protection
- **XSS Prevention** - Input sanitization and output encoding

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Dark Mode Support** - Toggle between light and dark themes
- **Animations** - Smooth transitions with Framer Motion and GSAP
- **3D Elements** - Three.js integration for enhanced visuals
- **Real-time Updates** - Live updates without page refresh
- **Progressive Web App** - PWA capabilities for mobile experience
- **Accessibility** - ARIA labels and keyboard navigation support

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables for production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- File upload size limitations (configure based on server capacity)
- Email service configuration required for notifications
- 2FA setup requires proper time synchronization

## 🔮 Future Enhancements

- **Payment Integration** - Stripe/PayPal integration for actual payments
- **Video Calls** - WebRTC integration for client-freelancer calls
- **AI Matching** - Enhanced AI-powered job-freelancer matching
- **Mobile App** - React Native mobile application
- **Advanced Analytics** - Detailed analytics dashboard
- **Multi-language Support** - Internationalization (i18n)
- **Social Login** - Google/Facebook authentication
- **Contract Management** - Digital contract signing
- **Time Tracking** - Built-in time tracking for projects
- **Dispute Resolution** - Automated dispute resolution system

## 📧 Support

For support, please contact [shamitmishra22@gmail.com] or create an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- Socket.io team for real-time capabilities
- TailwindCSS for the utility-first CSS framework
- All other open-source contributors whose packages made this project possible

---

**Made with ❤️ by [Shamit]**
