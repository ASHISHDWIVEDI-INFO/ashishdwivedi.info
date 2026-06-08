const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  getAllSkills, getSkill, createSkill, updateSkill,
  deleteSkill, reorderSkills, bulkCreate,
} = require('../controllers/skill.controller');
const { protect } = require('../middleware/auth.middleware');

const skillValidation = [
  body('name').trim().notEmpty().withMessage('Skill name is required')
    .isLength({ max: 60 }).withMessage('Name max 60 chars'),
  body('category').notEmpty().withMessage('Category is required')
    .isIn(['frontend','backend','database','cloud-devops','mobile','ai-ml','tools','soft-skills','other'])
    .withMessage('Invalid category'),
  body('proficiency').optional().isInt({ min: 1, max: 100 })
    .withMessage('Proficiency must be 1–100'),
  body('level').optional()
    .isIn(['beginner','intermediate','advanced','expert']).withMessage('Invalid level'),
];

// Public
router.get('/',    getAllSkills);
router.get('/:id', getSkill);

// Protected
router.post('/bulk',    protect, bulkCreate);
router.put('/reorder',  protect, reorderSkills);
router.post('/',        protect, skillValidation, createSkill);
router.put('/:id',      protect, skillValidation, updateSkill);
router.delete('/:id',   protect, deleteSkill);

module.exports = router;
