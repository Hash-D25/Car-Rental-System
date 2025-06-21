const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../controllers/authController');

// Get all payments for the logged-in user
router.get('/', verifyToken, paymentController.getPayments);

// Create a new payment (for a booking)
router.post('/booking', verifyToken, paymentController.createPaymentForBooking);

// Mark a payment as completed
router.patch('/:id/complete', verifyToken, paymentController.completePayment);

// This route is general, but should also be protected
router.post('/', verifyToken, paymentController.createPayment);

module.exports = router; 