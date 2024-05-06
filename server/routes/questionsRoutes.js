const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');


router.get('/', questionsController.getAllQuestions);


router.post('/addQuestion', questionsController.createQuestion);


router.get('/search', questionsController.searchQuestions);


router.put('/:id/incrementViews', questionsController.incrementQuestionViews);


router.get('/byTag/:tagName', questionsController.getQuestionsByTagName);


router.get('/:id', questionsController.getQuestionById);


router.put('/:id/upvote', questionsController.upvoteQuestion);
router.put('/:id/downvote', questionsController.downvoteQuestion);


module.exports = router;
