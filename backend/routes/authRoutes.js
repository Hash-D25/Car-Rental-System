const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (require authentication)
router.get('/profile', authController.verifyToken, authController.getProfile);
router.put('/profile', authController.verifyToken, authController.updateProfile);
router.put('/change-password', authController.verifyToken, authController.changePassword);

module.exports = router; 