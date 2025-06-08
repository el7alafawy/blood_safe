const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recepient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  donationDate: {
    type: Date,
    required: true
  },
  location: {
    name:{
      type:String,
      required:true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
donationSchema.index({ location: '2dsphere' });

// Index for efficient querying
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ hospital: 1, status: 1 });
donationSchema.index({ bloodType: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation; 