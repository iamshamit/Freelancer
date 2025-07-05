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
  },
  {
    name: 'Event Planning',
    description: 'Planning and execution of events, meetings, and conferences',
    icon: 'event'
  },
  {
    name: 'Personal Training',
    description: 'Fitness coaching, workout planning, and health advice',
    icon: 'fitness_center'
  },
  {
    name: 'Tutoring & Education',
    description: 'Online tutoring, academic assistance, and educational support services',
    icon: 'school'
  },
  {
   name: 'Legal Services',
   description: 'Legal Consultation, document review, and legal representation',
   icon: 'gavel'
  },
  {
    name: 'Customer Service',
    description: 'Providing customer support, handling inquiries, and resolving issues',
    icon: 'headset_mic'
  }
];

// Seed admin user
const adminUser = {
  name: 'Admin User',
  email: 'shamitmishra@gmail.com',
  password: 'iamshamit',
  role: 'admin',
  bio: 'i am him!'
};



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
      await User.create(adminUser);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // // Create sample users (optional - comment out in production)
    // const existingUsers = await User.countDocuments({ role: { $in: ['freelancer', 'employer'] } });
    
    // if (existingUsers === 0) {
    //   // Hash passwords for sample users
    //   const saltRounds = 10;
      
    //   for (let user of [...sampleFreelancers, ...sampleEmployers]) {
    //     user.password = await bcrypt.hash(user.password, saltRounds);
    //   }
      
    //   await User.insertMany([...sampleFreelancers, ...sampleEmployers]);
    //   console.log(`✅ Created ${sampleFreelancers.length + sampleEmployers.length} sample users`);
    // } else {
    //   console.log('ℹ️  Sample users already exist');
    // }
    
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