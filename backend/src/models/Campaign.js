const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  targetUnits: {
    type: Number,
    required: true,
    min: 1
  },
  collectedUnits: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'UPCOMING'
  },
  bloodTypes: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }],
  requirements: {
    age: {
      min: Number,
      max: Number
    },
    weight: {
      min: Number
    },
    healthConditions: [String]
  },
  contactInfo: {
    phone: String,
    email: String
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'REGISTERED'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for efficient querying
campaignSchema.index({ status: 1, startDate: 1 });
campaignSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema); 