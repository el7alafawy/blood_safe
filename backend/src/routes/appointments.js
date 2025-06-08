const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const {auth} = require('../middleware/auth');
const { isHospital, isAdmin } = require('../middleware/roles');

// Validation middleware
const validateAppointment = [
  body('date').isISO8601(),
  body('timeSlot.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('timeSlot.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('notes').optional(),
  body('campaignId').optional().isMongoId()
];

// Create an appointment (Hospital only)
router.post('/', auth, isHospital, validateAppointment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = new Appointment({
      ...req.body,
      hospitalId: req.user.id
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments (Hospital and Users)
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'hospital') {
      query.hospitalId = req.user.id;
    } else {
      query.userId = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('hospitalId', 'name email phone')
      .populate('userId', 'name email phone bloodType')
      .populate('campaignId', 'title')
      .sort({ date: 1, 'timeSlot.start': 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available time slots for a date (Hospital only)
router.get('/available-slots/:date', auth, isHospital, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const existingAppointments = await Appointment.find({
      hospitalId: req.user.id,
      date: date,
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    });

    // Generate all possible time slots (30-minute intervals)
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        const endTime = minute === '30' ? 
          `${(hour + 1).toString().padStart(2, '0')}:00` : 
          `${hour.toString().padStart(2, '0')}:30`;

        // Check if slot is available
        const isBooked = existingAppointments.some(apt => 
          apt.timeSlot.start === time || 
          (apt.timeSlot.start < time && apt.timeSlot.end > time)
        );

        if (!isBooked) {
          slots.push({
            start: time,
            end: endTime
          });
        }
      }
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific appointment
router.get('/:id', auth, param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('hospitalId', 'name email phone')
      .populate('userId', 'name email phone bloodType')
      .populate('campaignId', 'title');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to view
    if (req.user.role !== 'admin' && 
        appointment.hospitalId.toString() !== req.user.id && 
        appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment status (Hospital only)
router.patch('/:id/status', auth, isHospital, [
  body('status').isIn(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  body('healthCheck').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.hospitalId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = req.body.status;
    if (req.body.healthCheck) {
      appointment.healthCheck = req.body.healthCheck;
    }

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book an appointment (Users only)
router.post('/:id/book', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Appointment is not available' });
    }

    appointment.userId = req.user.id;
    appointment.status = 'CONFIRMED';
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel an appointment
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to cancel
    if (req.user.role !== 'admin' && 
        appointment.hospitalId.toString() !== req.user.id && 
        appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Appointment already cancelled' });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    appointment.status = 'CANCELLED';
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an appointment (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.remove();
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 