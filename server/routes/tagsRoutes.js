const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagsController');


router.post('/', tagsController.createTag);


router.get('/', tagsController.getAllTags);


router.get('/:id', tagsController.getTagById);

module.exports = router;
