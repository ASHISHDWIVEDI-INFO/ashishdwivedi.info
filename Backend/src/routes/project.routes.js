const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  getAllProjects, getProject, createProject, updateProject,
  deleteProject, uploadImage, toggleFeatured, togglePublished,
  reorderProjects,
} = require('../controllers/project.controller');

const { protect }  = require('../middleware/auth.middleware');
const { uploadProjectImage, handleUploadError } = require('../middleware/upload.middleware');

// ── Validators ───────────────────────────────
const projectValidation = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title max 120 chars'),
  body('shortDescription')
    .optional().isLength({ max: 300 }).withMessage('Short description max 300 chars'),
  body('category')
    .optional()
    .isIn(['web','mobile','ai-ml','devops','open-source','startup','other'])
    .withMessage('Invalid category'),
  body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
  body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
  body('status')
    .optional()
    .isIn(['in-progress','completed','archived','on-hold'])
    .withMessage('Invalid status'),
];

// ========================
// Public Routes
// ========================
router.get('/',    getAllProjects);
router.get('/:id', getProject);

// ========================
// Protected Routes (Admin)
// ========================
router.post(  '/',                protect, projectValidation, createProject);
router.put(   '/reorder',         protect, reorderProjects);
router.put(   '/:id',             protect, projectValidation, updateProject);
router.delete('/:id',             protect, deleteProject);

// Image upload
router.post(
  '/:id/image',
  protect,
  uploadProjectImage.single('image'),
  handleUploadError,
  uploadImage
);

// Toggles
router.patch('/:id/featured', protect, toggleFeatured);
router.patch('/:id/publish',  protect, togglePublished);

module.exports = router;

