const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const carController = require('../controllers/carController');
const { verifyToken, requireAdmin } = require('../controllers/authController');

// Protect all routes in this file
router.use(verifyToken, requireAdmin);

// Car management routes
router.get('/cars', adminController.getAllCars);
router.post('/cars', carController.createCar); // Reuse createCar from carController
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);

// Booking and Payment management routes
router.get('/bookings', adminController.getAllBookings);
router.get('/payments', adminController.getAllPayments);

// User management
router.get('/users', adminController.getAllUsers);

module.exports = router; 