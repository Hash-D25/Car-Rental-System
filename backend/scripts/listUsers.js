const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const DB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/test';

const listUsers = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('MongoDB connected successfully');

    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users in database:');
      users.forEach(user => {
        // user.toObject() is used to get a plain object, then we can add properties
        const userObject = user.toObject();
        // The password in the DB is a hash, so we don't want to show it.
        // The toJSON method in the model should already be doing this, but as a safeguard:
        delete userObject.password;
        console.log(userObject);
      });
    }
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    mongoose.connection.close();
  }
};

listUsers(); 