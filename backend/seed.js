const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_safe')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
const User = require('./src/models/User');
const BloodRequest = require('./src/models/BloodRequest');
const Donation = require('./src/models/Donation');

async function main() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    await Donation.deleteMany({});

    // Create admin user
    const admin = {
      name: 'Admin User',
      email: 'admin@bloodsafe.com',
      password: 'admin123',
      phone: '0500000000',
      bloodType: 'O+',
      location: {
        type: 'Point',
        coordinates: [46.6753, 24.7136] // Riyadh coordinates
      },
      address: 'Riyadh, Saudi Arabia',
      role: 'admin',
      isAvailable: true
    };

    // Create demo users
    const users = [
      {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'password123',
        phone: '0501234567',
        bloodType: 'A+',
        location: {
          type: 'Point',
          coordinates: [46.6753, 24.7136] // Riyadh coordinates
        },
        address: 'الرياض، حي النخيل',
        role: 'donor',
        isAvailable: true
      },
      {
        name: 'سارة أحمد',
        email: 'sara@example.com',
        password: 'password123',
        phone: '0502345678',
        bloodType: 'O+',
        location: {
          type: 'Point',
          coordinates: [39.1728, 21.5433] // Jeddah coordinates
        },
        address: 'جدة، حي الروضة',
        role: 'donor',
        isAvailable: true
      },
      {
        name: 'محمد علي',
        email: 'mohammed@example.com',
        password: 'password123',
        phone: '0503456789',
        bloodType: 'B-',
        location: {
          type: 'Point',
          coordinates: [50.1032, 26.4207] // Dammam coordinates
        },
        address: 'الدمام، حي الشاطئ',
        role: 'donor',
        isAvailable: true
      }
    ];

    // Create demo hospitals
    const hospitals = [
      {
        name: 'مستشفى الملك فهد',
        email: 'hospital1@example.com',
        password: 'password123',
        phone: '0112345678',
        bloodType: 'O+',
        location: {
          type: 'Point',
          coordinates: [46.6753, 24.7136] // Riyadh coordinates
        },
        address: 'الرياض، حي العليا',
        role: 'hospital',
        isAvailable: true
      },
      {
        name: 'مستشفى الملك عبدالعزيز',
        email: 'hospital2@example.com',
        password: 'password123',
        phone: '0123456789',
        bloodType: 'O+',
        location: {
          type: 'Point',
          coordinates: [39.1728, 21.5433] // Jeddah coordinates
        },
        address: 'جدة، حي الروضة',
        role: 'hospital',
        isAvailable: true
      }
    ];

    console.log('Creating admin user...');
    const adminUser = await User.create(admin);

    console.log('Creating users...');
    const createdUsers = await User.create(users);

    console.log('Creating hospitals...');
    const createdHospitals = await User.create(hospitals);

    // Create blood requests
    const bloodRequests = [
      {
        hospitalId: createdHospitals[0]._id,
        bloodType: 'A+',
        units: 2,
        urgency: 'HIGH',
        status: 'PENDING',
        purpose: 'عمليات جراحية عاجلة',
        notes: 'مطلوب دم عاجل لعمليات جراحية',
        requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        hospitalId: createdHospitals[1]._id,
        bloodType: 'O+',
        units: 1,
        urgency: 'MEDIUM',
        status: 'PENDING',
        purpose: 'عمليات عادية',
        notes: 'مطلوب دم لعمليات عادية',
        requiredBy: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      }
    ];

    console.log('Creating blood requests...');
    await BloodRequest.create(bloodRequests);

    // Create donations
    const donations = [
      {
        donor: createdUsers[0]._id,
        hospital: createdHospitals[0]._id,
        bloodType: 'A+',
        units: 1,
        status: 'pending',
        donationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        location: {
          type: 'Point',
          coordinates: [46.6753, 24.7136] // Riyadh coordinates
        },
        notes: 'متبرع بالدم'
      },
      {
        donor: createdUsers[1]._id,
        hospital: createdHospitals[1]._id,
        bloodType: 'O+',
        units: 1,
        status: 'pending',
        donationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: {
          type: 'Point',
          coordinates: [39.1728, 21.5433] // Jeddah coordinates
        },
        notes: 'متبرع بالدم'
      }
    ];

    console.log('Creating donations...');
    await Donation.create(donations);

    console.log('Demo data created successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@bloodsafe.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

main(); 