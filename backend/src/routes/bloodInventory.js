const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const BloodInventory = require('../models/BloodInventory');
const {auth} = require('../middleware/auth');
const { isHospital, isAdmin } = require('../middleware/roles');

// Validation middleware
const validateInventory = [
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('availableUnits').isInt({ min: 0 }),
  body('reservedUnits').optional().isInt({ min: 0 }),
  body('expiryDate').isISO8601(),
  body('status').isIn(['AVAILABLE', 'RESERVED', 'EXPIRED', 'USED']),
  body('source').isIn(['DONATION', 'TRANSFER', 'PURCHASE']),
  body('donationId').optional().isMongoId(),
  body('notes').optional()
];

// Add blood to inventory (Hospital only)
router.post('/', auth, isHospital, validateInventory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = new BloodInventory({
      ...req.body,
      hospitalId: req.user.id
    });

    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get inventory (Hospital and Admin)
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'hospital' ? { hospitalId: req.user.id } : {};
    const inventory = await BloodInventory.find(query)
      .populate('hospitalId', 'name')
      .populate('donationId')
      .sort({ expiryDate: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get inventory by blood type
router.get('/blood-type/:type', auth, async (req, res) => {
  try {
    const query = {
      bloodType: req.params.type,
      status: 'AVAILABLE',
      expiryDate: { $gt: new Date() }
    };

    if (req.user.role === 'hospital') {
      query.hospitalId = req.user.id;
    }

    const inventory = await BloodInventory.find(query)
      .populate('hospitalId', 'name')
      .sort({ expiryDate: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory item (Hospital only)
router.put('/:id', auth, isHospital, validateInventory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await BloodInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (inventory.hospitalId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedInventory = await BloodInventory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedInventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reserve blood units (Hospital only)
router.patch('/:id/reserve', auth, isHospital, [
  body('units').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await BloodInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (inventory.availableUnits < req.body.units) {
      return res.status(400).json({ message: 'Not enough units available' });
    }

    inventory.availableUnits -= req.body.units;
    inventory.reservedUnits += req.body.units;
    inventory.status = inventory.availableUnits === 0 ? 'RESERVED' : 'AVAILABLE';

    await inventory.save();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark blood as used (Hospital only)
router.patch('/:id/use', auth, isHospital, [
  body('units').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await BloodInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (inventory.reservedUnits < req.body.units) {
      return res.status(400).json({ message: 'Not enough units reserved' });
    }

    inventory.reservedUnits -= req.body.units;
    if (inventory.reservedUnits === 0 && inventory.availableUnits === 0) {
      inventory.status = 'USED';
    }

    await inventory.save();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory item (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const inventory = await BloodInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await inventory.remove();
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 