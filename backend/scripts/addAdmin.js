const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

// Connect to MongoDB
const DB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/test';
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB connected for admin creation.'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Admin User Details - You can modify these
const adminDetails = {
    name: 'Admin User',
    email: 'admin@carrental.com',
    password: 'adminpassword',
    role: 'admin'
};

const addAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminDetails.email });
        if (existingAdmin) {
            console.log('Admin user with this email already exists.');
            return;
        }

        // Create and save the new admin user
        const admin = new User(adminDetails);
        await admin.save();
        console.log('Admin user created successfully!');
        console.log(`Email: ${admin.email}`);
        console.log('Password: adminpassword');

    } catch (error) {
        console.error('Error creating admin user:', error.message);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

addAdmin(); 