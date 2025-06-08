const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    name:{
      type:String,
      required:false
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },
  purpose: {
    type: String,
    required: true
  },
  notes: String,
  requiredBy: {
    type: Date,
    required: true
  },
  fulfilledBy: [{
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    fulfilledAt: Date
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
bloodRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema); 