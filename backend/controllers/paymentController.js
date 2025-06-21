const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
    try {
        const { status, dateRange } = req.query;
        let query = { userId: req.userId }; // Filter by user ID

        if (status) {
            query.status = status;
        }

        if (dateRange) {
            const today = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'last7':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'last30':
                    startDate.setDate(today.getDate() - 30);
                    break;
                case 'last90':
                    startDate.setDate(today.getDate() - 90);
                    break;
                default:
                    break;
            }
            query.date = { $gte: startDate };
        }

        const payments = await Payment.find(query).sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new payment
exports.createPayment = async (req, res) => {
    const payment = new Payment(req.body);
    try {
        const newPayment = await payment.save();
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create a new payment for a booking
exports.createPaymentForBooking = async (req, res) => {
    try {
        const { carId, carName, amount, status } = req.body;
        if (!carId || !carName || !amount) {
            return res.status(400).json({ message: 'Missing required payment fields' });
        }
        const payment = new Payment({
            userId: req.userId, // Associate payment with user
            bookingId: carId,
            carName,
            amount,
            status: status || 'Pending'
        });
        const newPayment = await payment.save();
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mark a payment as completed
exports.completePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        // Security check to ensure the user owns this payment
        if (payment.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'You are not authorized to complete this payment.' });
        }

        payment.status = 'Completed';
        await payment.save();
        res.json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 