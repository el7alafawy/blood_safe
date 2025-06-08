const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  availableUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedUnits: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['AVAILABLE', 'RESERVED', 'EXPIRED', 'USED'],
    default: 'AVAILABLE'
  },
  source: {
    type: String,
    required: true,
    enum: ['DONATION', 'TRANSFER', 'PURCHASE']
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  notes: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update the lastUpdated timestamp before saving
bloodInventorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Add index for efficient querying
bloodInventorySchema.index({ hospitalId: 1, bloodType: 1, status: 1 });

module.exports = mongoose.model('BloodInventory', bloodInventorySchema); 