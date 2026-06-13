const express = require('express');
const router  = express.Router();
const c = require('../controllers/media.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadMedia, handleUploadError } = require('../middleware/upload.middleware');

router.post('/upload', protect, uploadMedia.single('file'), handleUploadError, c.uploadMedia);
router.get('/',        protect, c.getAllMedia);
router.get('/:id',     c.serveMedia);
router.delete('/:id',  protect, c.deleteMedia);
module.exports = router;
