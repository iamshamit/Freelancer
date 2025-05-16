// backend/models/Domain.js
const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'code' // Default icon name
  },
  active: {
    type: Boolean,
    default: true
  },
  jobCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;