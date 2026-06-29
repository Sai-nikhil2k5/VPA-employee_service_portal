const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  subRequest: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Escalated', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  date: {
    type: String,
    required: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolutionRemarks: {
    type: String,
    default: ''
  },
  resolutionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Request', RequestSchema);
