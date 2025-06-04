// backend/models/index.js
const User = require('./User');
const Job = require('./Job');
const Chat = require('./Chat');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const Admin = require('./Admin');
const Escrow = require('./Escrow');
const Domain = require('./Domain');
const Milestone = require('./Milestone');

module.exports = {
  User,
  Job,
  Chat,
  Transaction,
  Notification,
  Admin,
  Escrow,
  Domain,
  Milestone
};