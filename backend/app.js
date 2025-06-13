const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const carRoutes = require('./routes/carRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/car-rental-system';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if cannot connect to database
    });

// Routes
app.use('/api/cars', carRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});