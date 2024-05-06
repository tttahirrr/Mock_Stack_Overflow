const mongoose = require('mongoose');


const answerSchema = new mongoose.Schema({
   text: { type: String, required: true },
   ans_by: { type: String, required: true },
   ans_date_time: { type: Date, default: Date.now },
   question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
   upvotes: [{ type: String, default: ''}], // an array of all user ID's that upvoted. 
   downvotes: [{ type: String, default: '' }], // an array of all user ID's that downvoted
   netVotes: { type: Number, default: 0 }, // (length of upvotes) - (length of downvotes)
   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});


answerSchema.virtual('url').get(function() {
   return `/posts/answer/${this._id}`;
});


module.exports = mongoose.model('Answer', answerSchema);

