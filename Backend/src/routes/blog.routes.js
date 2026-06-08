const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  getAllPosts, getPost, createPost, updatePost,
  deletePost, togglePublish, toggleFeatured, uploadCover,
} = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadMedia, handleUploadError } = require('../middleware/upload.middleware');

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title max 200 chars'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt max 500 chars'),
];

// Public
router.get('/',       getAllPosts);
router.get('/:slug',  getPost);

// Protected
router.post('/',               protect, blogValidation, createPost);
router.put('/:id',             protect, blogValidation, updatePost);
router.delete('/:id',          protect, deletePost);
router.patch('/:id/publish',   protect, togglePublish);
router.patch('/:id/featured',  protect, toggleFeatured);
router.post('/:id/cover',      protect, uploadMedia.single('cover'), handleUploadError, uploadCover);

module.exports = router;
