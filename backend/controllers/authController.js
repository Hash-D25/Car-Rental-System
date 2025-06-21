const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Payment = require('../models/Payment');
const Car = require('../models/Car');
const mongoose = require('mongoose');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, address, licenseNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            phone,
            address,
            licenseNumber
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, licenseNumber } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (licenseNumber) user.licenseNumber = licenseNumber;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // by removing the token from localStorage
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed', error: error.message });
    }
};

// Verify token middleware
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Check if user is admin
exports.requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: 'Authorization failed', error: error.message });
    }
};

exports.getUserDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Get count of active reservations
        const reservationsCount = await Car.countDocuments({
            'bookingDetails.userId': userId,
            isBooked: true
        });
        
        // Get stats from completed payments
        const paymentStats = await Payment.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    rentedHistoryCount: { $sum: 1 },
                    totalSpent: { $sum: '$amount' }
                }
            }
        ]);

        const rentedHistoryCount = paymentStats.length > 0 ? paymentStats[0].rentedHistoryCount : 0;
        const totalSpent = paymentStats.length > 0 ? paymentStats[0].totalSpent : 0;

        res.status(200).json({
            status: 'success',
            data: {
                reservationsCount,
                rentedHistoryCount,
                totalSpent
            }
        });

    } catch (error) {
        console.error('Error fetching user dashboard stats:', error);
        res.status(500).json({ message: 'Server error while fetching stats.' });
    }
}; 