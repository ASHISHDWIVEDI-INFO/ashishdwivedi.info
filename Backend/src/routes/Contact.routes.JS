const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  submitContact, getAllContacts, getContact,
  toggleRead, toggleStar, toggleArchive,
  markReplied, deleteContact, bulkDelete, exportCSV,
} = require('../controllers/contact.controller');
const { protect } = require('../middleware/auth.middleware');

// ── Validators ───────────────────────────────
const submitValidation = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name max 100 chars'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('subject')
    .trim().notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject max 200 chars'),
  body('message')
    .trim().notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be 10–5000 characters'),
];

// ========================
// Public
// ========================
router.post('/', submitValidation, submitContact);

// ========================
// Admin (Protected)
// ========================
router.get(   '/',              protect, getAllContacts);
router.get(   '/export',        protect, exportCSV);
router.get(   '/:id',           protect, getContact);
router.patch( '/:id/read',      protect, toggleRead);
router.patch( '/:id/star',      protect, toggleStar);
router.patch( '/:id/archive',   protect, toggleArchive);
router.patch( '/:id/reply',     protect, markReplied);
router.delete('/bulk',          protect, bulkDelete);
router.delete('/:id',           protect, deleteContact);

module.exports = router;
