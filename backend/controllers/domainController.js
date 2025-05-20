// backend/controllers/domainController.js
const { Domain } = require('../models');

// @desc    Get all domains
// @route   GET /api/domains
// @access  Public
const getDomains = async (req, res) => {
  try {
    const domains = await Domain.find({ active: true }).sort('name');
    res.json(domains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new domain
// @route   POST /api/domains
// @access  Private/Admin
const createDomain = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    // Check if domain already exists
    const domainExists = await Domain.findOne({ name });
    if (domainExists) {
      return res.status(400).json({ message: 'Domain already exists' });
    }

    const domain = await Domain.create({
      name,
      description,
      icon: icon || 'code'
    });

    res.status(201).json(domain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a domain
// @route   PUT /api/domains/:id
// @access  Private/Admin
const updateDomain = async (req, res) => {
  try {
    const { name, description, icon, active } = req.body;
    
    const domain = await Domain.findById(req.params.id);
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    domain.name = name || domain.name;
    domain.description = description || domain.description;
    domain.icon = icon || domain.icon;
    
    if (active !== undefined) {
      domain.active = active;
    }
    
    const updatedDomain = await domain.save();
    
    res.json(updatedDomain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get domain by ID
// @route   GET /api/domains/:id
// @access  Public
const getDomainById = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    
    if (domain) {
      res.json(domain);
    } else {
      res.status(404).json({ message: 'Domain not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDomains,
  createDomain,
  updateDomain,
  getDomainById
};