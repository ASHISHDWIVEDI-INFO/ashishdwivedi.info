const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  login,
  logout,
  refresh,
  changePassword,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ========================
// Validators
// ========================
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
];

// ========================
// Routes
// ========================

// POST /api/auth/login
router.post('/login', loginValidation, login);

// POST /api/auth/logout  (protected)
router.post('/logout', protect, logout);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// PUT /api/auth/change-password  (protected)
router.put('/change-password', protect, changePasswordValidation, changePassword);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
