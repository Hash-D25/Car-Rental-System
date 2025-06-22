const mongoose = require('mongoose');
const User = require('../models/user.js');
require('dotenv').config();

// Connect to MongoDB
const DB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/test';
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB connected to list users.'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const listUsers = async () => {
    try {
        const users = await User.find({}).select('-password'); // Exclude passwords from the result
        if (users.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        console.log('--- User List ---');
        users.forEach(user => {
            console.log(`
Name:    ${user.name}
Email:   ${user.email}
Role:    ${user.role}
User ID: ${user._id}
Created: ${user.createdAt.toDateString()}
-----------------`);
        });

    } catch (error) {
        console.error('Error listing users:', error.message);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

listUsers(); 