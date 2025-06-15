// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['freelancer', 'employer', 'admin'],
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  ratings: [{
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notificationPreferences: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: { 
        type: String, 
        enum: ['immediate', 'daily', 'weekly'], 
        default: 'immediate' 
      },
      types: {
        new_application: { type: Boolean, default: true },
        job_assigned: { type: Boolean, default: true },
        milestone_completed: { type: Boolean, default: true },
        payment_released: { type: Boolean, default: true },
        new_message: { type: Boolean, default: true },
        new_rating: { type: Boolean, default: true }
      }
    },
    push: {
      enabled: { type: Boolean, default: true },
      types: {
        new_application: { type: Boolean, default: true },
        job_assigned: { type: Boolean, default: true },
        milestone_completed: { type: Boolean, default: true },
        payment_released: { type: Boolean, default: true },
        new_message: { type: Boolean, default: true },
        new_rating: { type: Boolean, default: false }
      }
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      types: {
        new_application: { type: Boolean, default: true },
        job_assigned: { type: Boolean, default: true },
        milestone_completed: { type: Boolean, default: true },
        payment_released: { type: Boolean, default: true },
        new_message: { type: Boolean, default: true },
        new_rating: { type: Boolean, default: true }
      }
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' }
    }
  },
  savedSearches: [{
    query: String,
    filters: {
      type: String,
      domain: String,
      skills: [String],
      minBudget: Number,
      maxBudget: Number,
      minRating: Number
    },
    type: {
      type: String,
      enum: ['jobs', 'freelancers', 'all']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Privacy & Security Settings
  privacySettings: {
    activity: {
      showOnlineStatus: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: false }
    },
    messaging: {
      showReadReceipts: { type: Boolean, default: true },
      showTypingIndicator: { type: Boolean, default: true }
    },
    search: {
      appearInSearch: { type: Boolean, default: true },
      showInDirectory: { type: Boolean, default: true }
    }
  },
  // Security Settings
  securitySettings: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    backupCodes: [String],
    loginNotifications: { type: Boolean, default: true },
    unusualActivityAlerts: { type: Boolean, default: true },
    passwordChangedAt: Date,
  },
  // Account Status
  accountStatus: {
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,
    suspensionExpiresAt: Date,
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate average rating
userSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) return 0;
  
  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  return parseFloat((sum / this.ratings.length).toFixed(1));
};

const User = mongoose.model('User', userSchema);

module.exports = User;