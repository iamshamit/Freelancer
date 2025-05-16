// backend/utils/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Domain } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed domains
const domains = [
  {
    name: 'Web Development',
    description: 'Frontend, backend, and full-stack web development services',
    icon: 'code'
  },
  {
    name: 'Mobile Development',
    description: 'iOS, Android, and cross-platform mobile app development',
    icon: 'smartphone'
  },
  {
    name: 'UI/UX Design',
    description: 'User interface and user experience design services',
    icon: 'palette'
  },
  {
    name: 'Content Writing',
    description: 'Blog posts, articles, copywriting, and content creation',
    icon: 'edit'
  },
  {
    name: 'Digital Marketing',
    description: 'SEO, social media, email marketing, and PPC campaigns',
    icon: 'trending_up'
  },
  {
    name: 'Financial Advice',
    description: 'Financial planning, investment advice, and accounting services',
    icon: 'attach_money'
  },
  {
    name: 'Graphic Design',
    description: 'Logos, illustrations, branding, and visual design',
    icon: 'brush'
  },
  {
    name: 'Video Production',
    description: 'Video editing, animation, and motion graphics',
    icon: 'videocam'
  }
];

// Seed admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await Domain.deleteMany({});
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: adminUser.email });
    
    if (!adminExists) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(adminUser.password, salt);
      
      // Create admin user
      await User.create(adminUser);
      console.log('Admin user created');
    }
    
    // Insert domains
    await Domain.insertMany(domains);
    console.log('Domains seeded successfully');
    
    console.log('Seed completed successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();