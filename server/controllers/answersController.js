const Answer = require('../models/answers');
const Question = require('../models/questions');
const User = require('../models/users'); 



exports.addAnswer = async (req, res) => {
 const { questionId, text, ans_by } = req.body;
 try {
   const newAnswer = new Answer({
     text,
     ans_by,
     question_id: questionId,
   });


   const savedAnswer = await newAnswer.save();


   // update the question with the new answer's ID
   await Question.findByIdAndUpdate(questionId, { $push: { answers: savedAnswer._id }, $set: { latestAnswerDate: new Date() } });


   res.status(201).json(savedAnswer);
 } catch (error) {
   res.status(500).send(`Server error: ${error.message}`);
 }
};


exports.getAnswerById = async (req, res) => {
   try {
     const answer = await Answer.findById(req.params.id);
     if (!answer) {
       return res.status(404).send('Answer not found');
     }
     res.json(answer);
   } catch (error) {
     res.status(500).send(`Server error: ${error.message}`);
   }
 };



exports.upvoteAnswer = async (req, res) => {
    const { id } = req.params; // answer ID from URL
    const { userId } = req.body; // user ID from request body

    try {
        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({ message: 'Must be logged in to vote' });
        }

        
        if (user.reputationPoints < 50) {
            return res.status(200).json({ message: 'User not authorized to vote. Must have at least 50 points' });
        }
        

        if (answer.upvotes.includes(userId)) {
            return res.status(200).json({ message: 'User already upvoted this answer' });
        }

        // remove from downvotes if present
        if (answer.downvotes.includes(userId)) {
            answer.downvotes.pull(userId);
            answer.netVotes += 2; // remove downvote & add upvote
            user.reputationPoints += 15; // compensate for downvote & add for upvote
        } else {
            answer.netVotes += 1;
            user.reputationPoints += 5;
        }

        // add to upvotes
        answer.upvotes.push(userId);

        await answer.save();
        await user.save();

        res.json({
            message: 'Upvote successful',
            netVotes: answer.netVotes,
            userReputation: user.reputationPoints
        });
    } catch (error) {
        console.error(`Server error: ${error.message}`);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};


exports.downvoteAnswer = async (req, res) => {
  const { id } = req.params; // answer ID from URL
  const { userId } = req.body; // user ID from request body

  try {
      const answer = await Answer.findById(id);
      if (!answer) {
          return res.status(404).json({ message: 'Answer not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(200).json({ message: 'Must be logged in to vote' });
      }

      
      if (user.reputationPoints < 50) {
          return res.status(200).json({ message: 'User not authorized to vote. Must have at least 50 points' });
      }
      

      if (answer.downvotes.includes(userId)) {
          return res.status(200).json({ message: 'User already downvoted this answer' });
      }

      // remove from upvotes if present
      if (answer.upvotes.includes(userId)) {
          answer.upvotes.pull(userId);
          answer.netVotes -= 2; // remove upvote & add downvote
          user.reputationPoints -= 15; // compensate for upvote & subtract for downvote
      } else {
          answer.netVotes -= 1;
          user.reputationPoints -= 10;
      }

      // add to downvotes
      answer.downvotes.push(userId);

      await answer.save();
      await user.save();

      res.json({
          message: 'Downvote successful',
          netVotes: answer.netVotes,
          userReputation: user.reputationPoints
      });
  } catch (error) {
      console.error(`Server error: ${error.message}`);
      res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

