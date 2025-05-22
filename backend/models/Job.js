// backend/models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Domain",
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "assigned", "completed", "cancelled"],
    default: "open",
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  applicants: [
    {
      freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  milestonePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  paymentReleased: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;