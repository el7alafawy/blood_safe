const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create new donation request
router.post('/', [
  body('donor').isMongoId().withMessage('Invalid donor ID'),
  body('recepient').isMongoId().withMessage('Invalid user ID'),
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood type'),
  body('units').isInt({ min: 1, max: 2 }).withMessage('Units must be between 1 and 2'),
  body('donationDate').isISO8601().withMessage('Invalid date format'),
  body('location.coordinates').isArray().withMessage('Invalid location coordinates'),
  validateRequest
], async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, bloodType, donor, recepient } = req.query;
    const query = {};

    if (status) query.status = status;
    if (bloodType) query.bloodType = bloodType;
    if (donor) query.donor = donor;
    if (recepient) query.recepient = recepient;

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone bloodType')
      .populate('recepient', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby donation requests
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    const donations = await Donation.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: 'pending'
    })
    .populate('recepient', 'name email phone')
    .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'scheduled', 'completed', 'cancelled']).withMessage('Invalid status'),
  validateRequest
], async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // If donation is completed, update donor's last donation date
    if (req.body.status === 'completed') {
      await User.findByIdAndUpdate(donation.donor, {
        lastDonation: new Date()
      });
    }

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donations by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.params.userId })
      .populate('recepient', 'name email phone')
      .sort({ createdAt: -1 });

    if (!donations) {
      return res.status(404).json({ message: 'No donations found for this user' });
    }

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donations where user is recipient
router.get('/recipient/:userId', async (req, res) => {
  try {
    const donations = await Donation.find({ recepient: req.params.userId })
      .populate('donor', 'name email phone bloodType')
      .sort({ createdAt: -1 });

    if (!donations) {
      return res.status(404).json({ message: 'No donations found for this recipient' });
    }

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a donation 
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid donation ID'),
  validateRequest
], async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    await donation.deleteOne();
    res.json({ message: 'Donation deleted' });
  } catch (error) {
    res.statuserror.message(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 
  console.log()