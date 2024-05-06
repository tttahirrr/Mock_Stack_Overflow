const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
   text: { type: String, required: true },
   commented_by: { type: String, required: true },
   comment_date_time: { type: Date, default: Date.now },
   question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // a comment can either belong to a question or an answer
   answer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
   upvotes: [{ type: String, default: ''}], // an array of all user ID's that upvoted. I am unsure if I should make the type String or Number in order to easily do the searching for a user id in the questionsController
   downvotes: [{ type: String, default: '' }], // an array of all user ID's that downvoted
   netVotes: { type: Number, default: 0 }, // (length of upvotes) - (length of downvotes)
});

module.exports = mongoose.model('Comment', commentSchema);
