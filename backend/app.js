const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const carRoutes = require('./routes/carRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const carController = require('./controllers/carController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/test';

// Middleware
app.use(cors()); // Allow all origins for development
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
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/payments', paymentRoutes);

// Automated job to free up cars
setInterval(carController.freeUpCars, 60 * 60 * 1000); // every hour

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Car Rental API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});