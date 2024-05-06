

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true }, 
    reputationPoints: { type: Number, default: 0}
});

module.exports = mongoose.model('User', userSchema);


