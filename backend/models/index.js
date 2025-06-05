// backend/models/index.js
const User = require('./User');
const Job = require('./Job');
const Chat = require('./Chat');
const Notification = require('./Notification');
const Domain = require('./Domain');
const Milestone = require('./Milestone');
const Transaction = require('./Transaction');
const Escrow = require('./Escrow');
const Admin = require('./Admin');

module.exports = {
  User,
  Job,
  Chat,
  Notification,
  Domain,
  Milestone,
  Transaction,
  Escrow,
  Admin
};