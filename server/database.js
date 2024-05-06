const mongoose = require('mongoose');


const connectDB = async () => {
   mongoose.connect('mongodb://127.0.0.1:27017/fake_so').then(() => {
       console.log('MongoDB Connected');
     }).catch(err => {
       console.error('MongoDB connection error:', err);
     });
};


module.exports = connectDB;