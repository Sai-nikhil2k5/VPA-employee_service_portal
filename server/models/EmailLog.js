const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed', 'Mock Logged'],
    required: true
  },
  error: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);
