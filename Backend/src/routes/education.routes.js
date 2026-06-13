const express = require('express');
const router  = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/education.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/',    getAll);
router.get('/:id', getOne);
router.post('/',   protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
