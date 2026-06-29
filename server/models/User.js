const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  adminLevel: {
    type: String,
    enum: ['assistant', 'superior'],
    default: 'assistant'
  },
  designation: {
    type: String,
    default: ''
  },
  aadhaarNumber: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  emergencyMobile: {
    type: String,
    default: ''
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
