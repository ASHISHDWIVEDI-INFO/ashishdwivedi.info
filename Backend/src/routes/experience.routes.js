const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  getAllExperience, getExperience, createExperience,
  updateExperience, deleteExperience, reorderExperience,
} = require('../controllers/experience.controller');
const { protect } = require('../middleware/auth.middleware');

const experienceValidation = [
  body('role').trim().notEmpty().withMessage('Role is required')
    .isLength({ max: 120 }).withMessage('Role max 120 chars'),
  body('company').trim().notEmpty().withMessage('Company is required')
    .isLength({ max: 120 }).withMessage('Company max 120 chars'),
  body('startDate').notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date'),
  body('employmentType')
    .optional()
    .isIn(['full-time','part-time','contract','freelance','internship','co-founder'])
    .withMessage('Invalid employment type'),
];

// Public
router.get('/',    getAllExperience);
router.get('/:id', getExperience);

// Protected
router.put('/reorder', protect, reorderExperience);
router.post('/',       protect, experienceValidation, createExperience);
router.put('/:id',     protect, experienceValidation, updateExperience);
router.delete('/:id',  protect, deleteExperience);

module.exports = router;
