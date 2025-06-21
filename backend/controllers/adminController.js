const Car = require('../models/Car');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Get all cars for the admin dashboard
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a car's details
exports.updateCar = async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(updatedCar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a car
exports.deleteCar = async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all bookings (all cars that are currently booked)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Car.find({ isBooked: true });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all payments from all users
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCars = await Car.countDocuments();
        const rentedCars = await Car.countDocuments({ isBooked: true });
        
        const totalPayments = await Payment.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);

        const totalRevenue = totalPayments.length > 0 ? totalPayments[0].totalRevenue : 0;

        res.json({
            totalUsers,
            totalCars,
            rentedCars,
            availableCars: totalCars - rentedCars,
            totalRevenue
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).send('Server error');
    }
}; 