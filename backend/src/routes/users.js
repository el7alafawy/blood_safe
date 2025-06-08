const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const Donation = require('../models/Donation');
const Request = require('../models/BloodRequest');

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.patch('/me', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood type'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  validateRequest
], async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phone', 'address', 'bloodType', 'isAvailable', 'location'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donors (for admin/hospital)
router.get('/donors', auth, authorize('admin', 'hospital'), async (req, res) => {
  try {
    const { bloodType, isAvailable, search } = req.query;
    const query = { role: 'user' };

    if (bloodType) query.bloodType = bloodType;
    if (isAvailable) query.isAvailable = isAvailable === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const donors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(donors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby donors
router.get('/donors/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000, bloodType } = req.query;
    const query = {
      role: 'user',
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };

    if (bloodType) query.bloodType = bloodType;

    const donors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(donors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'user', isAvailable: true});
    const totalHospitals = await User.countDocuments({ role: 'hospital' });

    res.json({
      bloodTypeStats: stats,
      totalUsers,
      totalDonors,
      totalHospitals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor statistics
router.get('/me/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get total donations
    const totalDonations = await Donation.countDocuments({ donor: userId });
    
    // Get active requests
    const activeRequests = await Request.countDocuments({
      donor: userId,
      status: { $in: ['pending', 'accepted'] }
    });
    
    // Get completed requests
    const completedRequests = await Request.countDocuments({
      donor: userId,
      status: 'completed'
    });
    
    // Get lifes saved (completed donations)
    const lifesSaved = await Donation.countDocuments({
      donor: userId,
      status: 'completed'
    });
    
    // Get last donation
    const lastDonation = await Donation.findOne({ donor: userId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    res.json({
      totalDonations,
      activeRequests,
      completedRequests,
      bloodType: req.user.bloodType,
      lifesSaved,
      lastDonation: lastDonation ? lastDonation.createdAt : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      role,
      bloodType,
      isAvailable,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (bloodType) query.bloodType = bloodType;
    if (isAvailable) query.isAvailable = isAvailable === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with sorting
    const users = await User.find(query)
      .select('-password')
      .sort(sort);

    res.json({
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 