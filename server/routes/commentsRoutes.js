const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

router.post('/question/:questionId', commentsController.addCommentToQuestion);

router.get('/byQuestion/:questionId', commentsController.getCommentsByQuestion);


router.post('/answer/:answerId', commentsController.addCommentToAnswer);

router.get('/byAnswer/:answerId', commentsController.getCommentsByAnswer);


router.put('/:id/upvote', commentsController.upvoteComment);

module.exports = router;
