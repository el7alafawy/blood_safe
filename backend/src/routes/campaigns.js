const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const {auth} = require('../middleware/auth');
const { isHospital, isAdmin } = require('../middleware/roles');

// Validation middleware
const validateCampaign = [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('location').notEmpty(),
  body('targetUnits').isInt({ min: 1 }),
  body('bloodTypes').isArray(),
  body('bloodTypes.*').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('requirements.age.min').optional().isInt({ min: 18, max: 65 }),
  body('requirements.age.max').optional().isInt({ min: 18, max: 65 }),
  body('requirements.weight.min').optional().isInt({ min: 50 }),
  body('requirements.healthConditions').optional().isArray(),
  body('contactInfo.phone').optional(),
  body('contactInfo.email').optional().isEmail()
];

// Create a new campaign (Hospital only)
router.post('/', auth, isHospital, validateCampaign, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = new Campaign({
      ...req.body,
      hospitalId: req.user.id
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'hospital') {
      query.hospitalId = req.user.id;
    }

    const campaigns = await Campaign.find(query)
      .populate('hospitalId', 'name email phone')
      .sort({ startDate: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active campaigns
router.get('/active', auth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'ACTIVE'
    };

    const campaigns = await Campaign.find(query)
      .populate('hospitalId', 'name email phone')
      .sort({ endDate: 1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific campaign
router.get('/:id', auth, param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await Campaign.findById(req.params.id)
      .populate('hospitalId', 'name email phone')
      .populate('participants.userId', 'name email phone bloodType');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a campaign (Hospital only)
router.put('/:id', auth, isHospital, validateCampaign, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.hospitalId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (campaign.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot update completed campaign' });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for a campaign (Users only)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    // Check if user is already registered
    const isRegistered = campaign.participants.some(
      p => p.userId.toString() === req.user.id
    );

    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this campaign' });
    }

    campaign.participants.push({
      userId: req.user.id,
      status: 'REGISTERED'
    });

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update participant status (Hospital only)
router.patch('/:id/participants/:userId', auth, isHospital, [
  body('status').isIn(['CONFIRMED', 'COMPLETED', 'CANCELLED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.hospitalId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const participant = campaign.participants.find(
      p => p.userId.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    participant.status = req.body.status;
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a campaign (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await campaign.remove();
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 