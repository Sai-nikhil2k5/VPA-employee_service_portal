const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LoginLog', LoginLogSchema);
