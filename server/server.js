const express = require('express'); // import express library
const app = express(); // initiailize app using express


const { exec } = require('child_process'); // to run populate_db.js


const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./database'); // MongoDB connection setup


//import models
const Question = require('./models/questions');
const Answer = require('./models/answers');
const Tag = require('./models/tags');


//import routes
const questionsRoutes = require('./routes/questionsRoutes');
const answersRoutes = require('./routes/answersRoutes');
const tagsRoutes = require('./routes/tagsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const commentsRoutes = require('./routes/commentsRoutes');






connectDB(); // connect to MongoDB


// middleware
app.use(cors());
app.use(express.json()); // for parsing JSON data in requests


// use routes
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);



// start the server
const port = process.env.PORT || 8000; // use port 8000 by default
const server = app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});




function gracefulShutdown() {
 console.log('SIGINT received, shutting down gracefully.');


 server.close(() => {
   console.log('HTTP server closed.');


   // use the promise returned by mongoose.connection.close()
   mongoose.connection.close(false).then(() => {
     console.log('Database instance disconnected');
     process.exit(0);
   }).catch((err) => {
     console.error('Error during database disconnection:', err);
     process.exit(1);
   });
 });
}


process.on('SIGINT', gracefulShutdown);
