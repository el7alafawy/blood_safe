const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const BloodRequest = require('../models/BloodRequest');
const {auth} = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Create a new blood request (Hospital only)
router.post('/', 
  auth,
  [
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('units').isInt({ min: 1 }),
    body('urgency').isIn(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
    body('purpose').notEmpty(),
    body('location.coordinates').isArray().withMessage('Invalid location coordinates'),
    body('requiredBy').isISO8601(),
    body('notes').optional(),
    
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bloodRequest = new BloodRequest({
        ...req.body,
        userId: req.user.id
      });

      await bloodRequest.save();
      res.status(201).json(bloodRequest);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get all blood requests 
router.get('/', auth, async (req, res) => {
  try {
    const query ={};
    if (req.query.bloodType) {
      query.bloodType = req.query.bloodType;
    }
    if (req.query.urgency) {
      query.urgency = req.query.urgency;
    }
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.user.id) {
      query.userId = req.user.id;
    }
    const bloodRequests = await BloodRequest.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bloodRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blood request statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
          },
          fulfilled: {
            $sum: { $cond: [{ $eq: ['$status', 'FULFILLED'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          },
          expired: {
            $sum: { $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalRequests = await BloodRequest.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: 'PENDING' });
    const completedRequests = await BloodRequest.countDocuments({ status: 'FULFILLED' });

    res.json({
      bloodTypeStats: stats,
      totalRequests,
      activeRequests,
      completedRequests,
      successRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific blood request
router.get('/:id', 
  [
    auth,
    param('id').isMongoId()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bloodRequest = await BloodRequest.findById(req.params.id)
        .populate('userId', 'name email phone')
        .populate('fulfilledBy.donationId');

      if (!bloodRequest) {
        return res.status(404).json({ message: 'Blood request not found' });
      }

      // Check if user has permission to view
      if (req.user.role !== 'admin' && bloodRequest.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json(bloodRequest);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update a blood request 
router.put('/:id', 
  [
    auth,
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('units').isInt({ min: 1 }),
    body('urgency').isIn(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
    body('purpose').notEmpty(),
    body('location.coordinates').isArray().withMessage('Invalid location coordinates'),
    body('requiredBy').isISO8601(),
    body('notes').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bloodRequest = await BloodRequest.findById(req.params.id);
      if (!bloodRequest) {
        return res.status(404).json({ message: 'Blood request not found' });
      }

      // Check if the user owns this request
      if (bloodRequest.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Don't allow updating if request is fulfilled or cancelled
      if (['FULFILLED', 'CANCELLED'].includes(bloodRequest.status)) {
        return res.status(400).json({ message: 'Cannot update fulfilled or cancelled request' });
      }

      const updatedRequest = await BloodRequest.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Cancel a blood request (Hospital only)
router.patch('/:id/cancel', 
  auth,
  async (req, res) => {
    try {
      const bloodRequest = await BloodRequest.findById(req.params.id);
      if (!bloodRequest) {
        return res.status(404).json({ message: 'Blood request not found' });
      }

      if (bloodRequest.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (bloodRequest.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Request already cancelled' });
      }

      if (bloodRequest.status === 'FULFILLED') {
        return res.status(400).json({ message: 'Cannot cancel fulfilled request' });
      }

      bloodRequest.status = 'CANCELLED';
      await bloodRequest.save();

      res.json(bloodRequest);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete a blood request (Admin only)
router.delete('/:id', 
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const bloodRequest = await BloodRequest.findById(req.params.id);
      if (!bloodRequest) {
        return res.status(404).json({ message: 'Blood request not found' });
      }

      await bloodRequest.remove();
      res.json({ message: 'Blood request deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


module.exports = router; 