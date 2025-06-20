const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Get all payments
router.get('/', paymentController.getPayments);

// Create a new payment
router.post('/', paymentController.createPayment);

// Create a new payment for a booking
router.post('/booking', paymentController.createPaymentForBooking);

// Mark a payment as completed
router.patch('/:id/complete', paymentController.completePayment);

module.exports = router; 