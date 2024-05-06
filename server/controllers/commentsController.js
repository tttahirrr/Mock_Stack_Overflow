const Comment = require('../models/comments'); 
const Question = require('../models/questions'); 
const User = require('../models/users'); 


exports.addCommentToQuestion = async (req, res) => {
    const { text, commented_by } = req.body;
    const { questionId } = req.params;


    try {
        // first check if the question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).send('Question not found');
        }

        // create a new comment
        const newComment = new Comment({
            text,
            commented_by,
            question_id: questionId,
        });

        // save the new comment
        const savedComment = await newComment.save();

        // push the comment's ID to the question's comments array
        question.comments.push(savedComment._id);
        await question.save();

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).send(`Server error: ${error.message}`);
    }
};


exports.getCommentsByQuestion = async (req, res) => {
    const { questionId } = req.params; // retrieve the questionId from the route parameter

    try {
        // find all comments for the given question ID
        const comments = await Comment.find({ question_id: questionId }).sort({ comment_date_time: -1 }); // Sorting by date, newest first
        if (!comments) {
            return res.status(404).json({ message: 'No comments found for this question' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments: ' + error.message });
    }
};


exports.upvoteComment = async (req, res) => {
    const { id } = req.params; // comment ID from URL
    const { userId } = req.body; // user ID from request body

    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({ message: 'Must be logged in to vote' });
        }

        
        if (user.reputationPoints < 50) {
            return res.status(200).json({ message: 'User not authorized to vote. Must have at least 50 points' });
        }
        

        if (comment.upvotes.includes(userId)) {
            return res.status(200).json({ message: 'User already upvoted this answer' });
        }

        // remove from downvotes if present
        if (comment.downvotes.includes(userId)) {
            comment.downvotes.pull(userId);
            comment.netVotes += 2; // remove downvote & add upvote
            user.reputationPoints += 15; // compensate for downvote & add for upvote
        } else {
            comment.netVotes += 1;
            user.reputationPoints += 5;
        }

        // add to upvotes
        comment.upvotes.push(userId);

        await comment.save();
        await user.save();

        res.json({
            message: 'Upvote successful',
            netVotes: comment.netVotes,
            userReputation: user.reputationPoints
        });
    } catch (error) {
        console.error(`Server error: ${error.message}`);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};



exports.addCommentToAnswer = async (req, res) => {
    const { answerId } = req.params;
    const { text, commented_by } = req.body;

    try {
        // first check if the answer exists
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).send('Answer not found');
        }

        // create & save the new comment
        const newComment = new Comment({
            text,
            commented_by,
            answer_id: answerId
        });

        const savedComment = await newComment.save();

        // update the answer's comment array
        answer.comments.push(savedComment._id);
        await answer.save();

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).send(`Server error: ${error.message}`);
    }
};

exports.getCommentsByAnswer = async (req, res) => {
    const { answerId } = req.params;

    try {
        const comments = await Comment.find({ answer_id: answerId }).sort({ comment_date_time: -1 });
        if (!comments.length) {
            return res.status(404).json({ message: 'No comments found for this answer' });
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments: ' + error.message });
    }
};
