const express = require('express');
const router = express.Router();
const answersController = require('../controllers/answersController');


router.post('/', answersController.addAnswer);


router.get('/:id', answersController.getAnswerById);



router.put('/:id/upvote', answersController.upvoteAnswer);
router.put('/:id/downvote', answersController.downvoteAnswer);

module.exports = router;
