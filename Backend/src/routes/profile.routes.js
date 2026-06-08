const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');

const {
  getProfile,
  updateProfile,
  uploadPhoto,
  servePhoto,
  uploadResume,
  downloadResume,
  getResumeInfo,
  deletePhoto,
  deleteResume,
} = require('../controllers/profile.controller');

const { protect } = require('../middleware/auth.middleware');
const {
  uploadPhoto: photoUpload,
  uploadResume: resumeUpload,
  handleUploadError,
} = require('../middleware/upload.middleware');

// ── Validators ───────────────────────────────
const profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('bio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Bio cannot exceed 2000 characters'),
  body('about')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('About cannot exceed 5000 characters'),
  body('availability')
    .optional()
    .isIn(['available', 'busy', 'not-available'])
    .withMessage('Invalid availability value'),
];

// ========================
// Public Routes
// ========================

// GET  /api/profile              → full profile JSON
router.get('/', getProfile);

// GET  /api/profile/photo        → stream profile photo
router.get('/photo', servePhoto);

// GET  /api/profile/resume/download → download resume PDF
router.get('/resume/download', downloadResume);

// ========================
// Protected Routes (Admin)
// ========================

// PUT  /api/profile              → update profile data
router.put('/', protect, profileValidation, updateProfile);

// POST /api/profile/photo        → upload profile photo
router.post(
  '/photo',
  protect,
  photoUpload.single('photo'),
  handleUploadError,
  uploadPhoto
);

// DELETE /api/profile/photo      → remove profile photo
router.delete('/photo', protect, deletePhoto);

// POST /api/profile/resume       → upload resume PDF
router.post(
  '/resume',
  protect,
  resumeUpload.single('resume'),
  handleUploadError,
  uploadResume
);

// GET  /api/profile/resume/info  → resume metadata + download count
router.get('/resume/info', protect, getResumeInfo);

// DELETE /api/profile/resume     → remove resume
router.delete('/resume', protect, deleteResume);

module.exports = router;
