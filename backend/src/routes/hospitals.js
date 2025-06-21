const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory')
const { auth, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all hospitals (for admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital profile
router.get('/:id', auth, async (req, res) => {
  try {
    const hospital = await User.findOne({ _id: req.params.id, role: 'hospital' })
      .select('-password');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hospital profile
router.patch('/:id', auth, authorize('hospital', 'admin'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  validateRequest
], async (req, res) => {
  try {
    if (req.user.role === 'hospital' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this hospital' });
    }

    const hospital = await User.findOne({ _id: req.params.id, role: 'hospital' });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phone', 'address', 'location'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => hospital[update] = req.body[update]);
    await hospital.save();

    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital's donation requests
router.get('/:id/donations', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ hospital: req.params.id })
      .populate('donor', 'name email phone bloodType')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital statistics
router.get('/:id/stats', async (req, res) => {
  try {
    
    // Get blood request stats
    const bloodRequestStats = await BloodRequest.aggregate([
      {
        $match: { userId:  new mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          fulfilled: {
            $sum: { $cond: [{ $eq: ['$status', 'FULFILLED'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get blood inventory stats
    const bloodInventoryStats = await BloodInventory.aggregate([
      {
        $match: { hospitalId:  new mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $group: {
          _id: '$bloodType',
          availableUnits: { $sum: '$availableUnits' },
          reservedUnits: { $sum: '$reservedUnits' }
        }
      }
    ]);

    // Calculate total available units
    const totalAvailableUnits = bloodInventoryStats.reduce((acc, curr) => acc + curr.availableUnits, 0);

    // Calculate total reserved units
    const totalReservedUnits = bloodInventoryStats.reduce((acc, curr) => acc + curr.reservedUnits, 0);


    res.json({
      bloodRequestStats,
      bloodInventoryStats,
      totalAvailableUnits,
      totalReservedUnits
    });
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby hospitals
router.get('/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    const hospitals = await User.find({
      role: 'hospital',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 