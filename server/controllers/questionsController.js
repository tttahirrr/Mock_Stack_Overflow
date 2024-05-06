const Question = require('../models/questions');  // import question model
const Tag = require('../models/tags');
const User = require('../models/users');
//const jwt = require('jsonwebtoken'); 
//const jwtDecode = require('jwt-decode');


exports.getAllQuestions = async (req, res) => {   // req (the HTTP request object) & res (the HTTP response object)
 try {
   const questions = await Question.find();      // Question.find() without any arguments returns all documents from the questions collection
   console.log(questions);
   res.json(questions);                          // responds by sending questions in json format back to client
 } catch (error) {
   res.status(500).send(error.message);
 }
};


exports.createQuestion = async (req, res) => {
   try {
     const newQuestion = new Question({
       title: req.body.title,
       text: req.body.text,
       asked_by: req.body.asked_by || 'Anonymous', // use 'Anonymous' if not provided
       tags: req.body.tags, // pass array of tag IDs
       summary: req.body.summary,
       // answers & views are default. latestAnswerDate will be null initially
     });
      await newQuestion.save();
     res.status(201).json(newQuestion); // respond with the created question document
   } catch (error) {
     res.status(400).send(error.message); // send a bad request error if something goes wrong
     console.error("error: ", error);
   }
 };


 // takes in a searchQuery. finds questions with those tags or those words in its title or text
 exports.searchQuestions = async (req, res) => {
   const { tags = '', keywords = '' } = req.query;
   const tagNames = tags.split(',').filter(Boolean).map(name => name.toLowerCase());
   const keywordArray = keywords.split(',').filter(Boolean);
    try {
     // resolve tag names to IDs
     const matchingTags = await Tag.find({ name: { $in: tagNames } });
     const tagIds = matchingTags.map(tag => tag._id);
      // make a query to search by tags & keywords
     const searchQuery = {
       $or: [
         ...(tagIds.length > 0 ? [{ tags: { $in: tagIds } }] : []),
         ...(keywordArray.length > 0 ? [
           { title: { $regex: keywordArray.join('|'), $options: 'i' } },
           { text: { $regex: keywordArray.join('|'), $options: 'i' } }
         ] : [])
       ]
     };
      let questions = searchQuery.$or.length > 0
       ? await Question.find(searchQuery).populate('tags') // make sure tags are populated
       : []; // return an empty array if no search conditions
      // transform questions to include tagNames instead of tags
     questions = await Promise.all(questions.map(async question => {
       const tagNames = question.tags.map(tag => tag.name); // this is possible if tags are populated
       return { ...question.toObject(), tagNames }; // convert document to object & append tagNames
     }));
      res.json(questions);
   } catch (error) {
     res.status(500).send(`Server error: ${error.message}`);
   }
 };




 exports.incrementQuestionViews = async (req, res) => {
   const { id } = req.params;
   try {
     const question = await Question.findById(id);
     if (!question) {
       return res.status(404).send('Question not found');
     }
     question.views += 1;
     await question.save();
     res.status(200).json(question);
   } catch (error) {
     res.status(500).send(`Server error: ${error.message}`);
   }
 };


 // find the tag by its name. use the tag's ID to find associated questions. return those questions
 exports.getQuestionsByTagName = async (req, res) => {
   try {
     const tagName = req.params.tagName;
     const tag = await Tag.findOne({ name: tagName });
     if (!tag) {
       return res.status(404).send('Tag not found');
     }
      const questions = await Question.find({ tags: tag._id }).populate('tags', 'name');
     res.json(questions);
   } catch (error) {
     res.status(500).send(`Server error: ${error.message}`);
   }
 };




 exports.getQuestionById = async (req, res) => {
   try {
     const question = await Question.findById(req.params.id).populate('answers');
     if (!question) {
       return res.status(404).send('Question not found');
     }
     res.json(question);
   } catch (error) {
     res.status(500).send(`Server error: ${error.message}`);
   }
 };



 


exports.upvoteQuestion = async (req, res) => {
  const { id } = req.params;  // question ID from URL
  const { userId } = req.body;  // user ID from request body

  try {
      const question = await Question.findById(id);
      if (!question) {
          return res.status(404).send('Question not found');
      }

      const user = await User.findById(userId);
      
      if (!user || user.reputationPoints < 50) {
          return res.status(200).send({message: 'User not authorized to vote with less that 50 reputation points'});
      }
      

      if (question.upvotes.includes(userId)) {
          return res.status(200).send({message: 'User has already upvoted this question'});
      }

      // remove from downvotes if present
      if (question.downvotes.includes(userId)) {
          question.downvotes.pull(userId);
          question.netVotes += 2;  // remove downvote and add upvote
          user.reputationPoints += 15;  // compensate for downvote and add for upvote
      } else {
          question.netVotes += 1;
          user.reputationPoints += 5;
      }

      // add to upvotes
      question.upvotes.push(userId);

      await question.save();
      await user.save();

      res.json({
          message: 'Upvote successful',
          netVotes: question.netVotes,
          userReputation: user.reputationPoints
      });
  } catch (error) {
      res.status(500).send(`Server error: ${error.message}`);
  }
};

 
 
exports.downvoteQuestion = async (req, res) => {
  const { id } = req.params;  // question ID from URL
  const { userId } = req.body;  // user ID from request body

  try {
      const question = await Question.findById(id);
      if (!question) {
          return res.status(404).send('Question not found');
      }

      const user = await User.findById(userId);
      
      if (!user || user.reputationPoints < 50) {
          return res.status(200).send({message: 'User not authorized to vote with less than 50 reputation points'});
      }
      

      if (question.downvotes.includes(userId)) {
          return res.status(200).send({message: 'User has already downvoted this question'});
      }

      // remove from upvotes if present
      if (question.upvotes.includes(userId)) {
          question.upvotes.pull(userId);
          question.netVotes -= 2;  // remove upvote & add downvote
          user.reputationPoints -= 15;  // compensate for upvote and subtract for downvote
      } else {
          question.netVotes -= 1;
          user.reputationPoints -= 10;
      }

      // add to downvotes
      question.downvotes.push(userId);

      await question.save();
      await user.save();

      res.json({
          message: 'Downvote successful',
          netVotes: question.netVotes,
          userReputation: user.reputationPoints
      });
  } catch (error) {
      res.status(500).send(`Server error: ${error.message}`);
  }
};


