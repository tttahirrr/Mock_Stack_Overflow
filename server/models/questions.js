const mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
   title: { type: String, required: true, maxlength: 100 },
   text: { type: String, required: true },
   asked_by: { type: String, default: 'Anonymous' },
   ask_date_time: { type: Date, default: Date.now },
   views: { type: Number, default: 0 },
   answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
   tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
   latestAnswerDate: { type: Date, default: null },
   upvotes: [{ type: String, default: ''}], // an array of all user ID's that upvoted. I am unsure if I should make the type String or Number in order to easily do the searching for a user id in the questionsController
   downvotes: [{ type: String, default: '' }], // an array of all user ID's that downvoted
   netVotes: { type: Number, default: 0 }, // (length of upvotes) - (length of downvotes)
   summary: { type: String, default: ''}, 
   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});


questionSchema.virtual('url').get(function() {
   return `/posts/question/${this._id}`;
});


module.exports = mongoose.model('Question', questionSchema);

