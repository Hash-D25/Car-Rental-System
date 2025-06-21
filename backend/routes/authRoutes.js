const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyToken,
  getProfile,
  updateProfile,
  changePassword,
  getUserDashboardStats
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (require authentication)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

// User dashboard stats
router.get('/profile/stats', verifyToken, getUserDashboardStats);

module.exports = router; 