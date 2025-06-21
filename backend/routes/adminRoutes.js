const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const carController = require('../controllers/carController');
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireAdmin } = require('../controllers/authController');
const authController = require('../controllers/authController');

// Protect all routes in this file
router.use(verifyToken, requireAdmin);

// Car management routes
router.get('/cars', carController.getAllCars);
router.post('/cars', carController.createCar);
router.put('/cars/:carId', carController.updateCar);
router.delete('/cars/:carId', carController.deleteCar);

// View all data
router.get('/cars/reserved', carController.getAllReservedCars);
router.get('/cars/rented', carController.getAllRentedCars);
router.get('/payments', paymentController.getAllPayments);

// Booking and Payment management routes
router.get('/bookings', adminController.getAllBookings);

// User management
router.get('/users', adminController.getAllUsers);

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

module.exports = router; 