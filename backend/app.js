const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const carRoutes = require('./routes/carRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const carController = require('./controllers/carController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/test';

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));
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
app.use('/api/payments', paymentRoutes);

// Automated job to free up cars
setInterval(carController.freeUpCars, 60 * 60 * 1000); // every hour

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});