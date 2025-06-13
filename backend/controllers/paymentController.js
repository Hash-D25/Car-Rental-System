const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
    try {
        let query = {};

        const { status, dateRange } = req.query;

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

        const payments = await Payment.find(query);
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