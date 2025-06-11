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

// Comprehensive domain list aligned with skill clusters
const domains = [
  {
    name: 'Web Development',
    description: 'Frontend, backend, and full-stack web development services including React, Node.js, and modern frameworks',
    icon: 'code'
  },
  {
    name: 'Mobile Development', 
    description: 'iOS, Android, React Native, Flutter and cross-platform mobile app development',
    icon: 'smartphone'
  },
  {
    name: 'UI/UX Design',
    description: 'User interface and user experience design, wireframing, prototyping, and user research',
    icon: 'palette'
  },
  {
    name: 'Graphic Design',
    description: 'Logos, branding, illustrations, print design, and visual identity creation',
    icon: 'brush'
  },
  {
    name: 'Digital Marketing',
    description: 'SEO, social media marketing, PPC campaigns, email marketing, and growth strategies',
    icon: 'trending_up'
  },
  {
    name: 'Content Writing',
    description: 'Blog posts, articles, copywriting, technical writing, and content strategy',
    icon: 'edit'
  },
  {
    name: 'Data Analysis',
    description: 'Data science, analytics, machine learning, statistical analysis, and business intelligence',
    icon: 'bar_chart'
  },
  {
    name: 'DevOps & Cloud',
    description: 'Cloud infrastructure, CI/CD, containerization, AWS, Azure, and deployment automation',
    icon: 'cloud'
  },
  {
    name: 'Video Production',
    description: 'Video editing, animation, motion graphics, and multimedia content creation',
    icon: 'videocam'
  },
  {
    name: 'E-commerce',
    description: 'Online store development, Shopify, WooCommerce, and e-commerce strategy',
    icon: 'shopping_cart'
  },
  {
    name: 'WordPress Development',
    description: 'WordPress customization, theme development, plugin creation, and maintenance',
    icon: 'web'
  },
  {
    name: 'Translation & Languages',
    description: 'Document translation, localization, and multilingual content services',
    icon: 'translate'
  },
  {
    name: 'Financial Services',
    description: 'Accounting, bookkeeping, financial planning, and business consulting',
    icon: 'attach_money'
  },
  {
    name: 'Virtual Assistance',
    description: 'Administrative support, project management, and business operations assistance',
    icon: 'support_agent'
  },
  {
    name: 'Photography',
    description: 'Product photography, photo editing, retouching, and visual content creation',
    icon: 'camera_alt'
  },
  {
    name: 'Cybersecurity',
    description: 'Security auditing, penetration testing, and security consulting services',
    icon: 'security'
  },
  {
    name: 'Game Development',
    description: 'Mobile games, web games, Unity development, and interactive experiences',
    icon: 'sports_esports'
  },
  {
    name: 'AI & Machine Learning',
    description: 'Artificial intelligence solutions, ML model development, and automation',
    icon: 'psychology'
  }
];

// Seed admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@freelanceplatform.com',
  password: 'admin123456',
  role: 'admin',
  bio: 'Platform administrator'
};

// Sample freelancer users for testing
const sampleFreelancers = [
  {
    name: 'John Developer',
    email: 'john@example.com',
    password: 'password123',
    role: 'freelancer',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    bio: 'Full-stack developer with 5+ years of experience in modern web technologies.',
    averageRating: 4.8,
    completedJobs: 15
  },
  {
    name: 'Sarah Designer',
    email: 'sarah@example.com', 
    password: 'password123',
    role: 'freelancer',
    skills: ['UI/UX Design', 'Figma', 'Adobe Photoshop', 'Graphic Design'],
    bio: 'Creative designer specializing in user-centered design and brand identity.',
    averageRating: 4.9,
    completedJobs: 23
  },
  {
    name: 'Mike Marketer',
    email: 'mike@example.com',
    password: 'password123', 
    role: 'freelancer',
    skills: ['Digital Marketing', 'SEO', 'Google Ads', 'Content Writing'],
    bio: 'Digital marketing expert helping businesses grow their online presence.',
    averageRating: 4.7,
    completedJobs: 31
  }
];

// Sample employer users
const sampleEmployers = [
  {
    name: 'TechCorp Inc',
    email: 'hr@techcorp.com',
    password: 'password123',
    role: 'employer',
    bio: 'Leading technology company seeking talented freelancers for innovative projects.'
  },
  {
    name: 'Creative Agency',
    email: 'contact@creativeagency.com', 
    password: 'password123',
    role: 'employer',
    bio: 'Full-service creative agency working with brands to create meaningful experiences.'
  }
];

// Seed function
const seedData = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await Domain.deleteMany({});
    console.log('Cleared existing domains');
    
    // Insert domains
    const createdDomains = await Domain.insertMany(domains);
    console.log(`✅ Created ${createdDomains.length} domains`);
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: adminUser.email });
    
    if (!adminExists) {
      // Hash password and create admin
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(adminUser.password, salt);
      await User.create(adminUser);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create sample users (optional - comment out in production)
    const existingUsers = await User.countDocuments({ role: { $in: ['freelancer', 'employer'] } });
    
    if (existingUsers === 0) {
      // Hash passwords for sample users
      const saltRounds = 10;
      
      for (let user of [...sampleFreelancers, ...sampleEmployers]) {
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
      
      await User.insertMany([...sampleFreelancers, ...sampleEmployers]);
      console.log(`✅ Created ${sampleFreelancers.length + sampleEmployers.length} sample users`);
    } else {
      console.log('ℹ️  Sample users already exist');
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nCreated domains:');
    createdDomains.forEach(domain => {
      console.log(`- ${domain.name}: ${domain.description}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();