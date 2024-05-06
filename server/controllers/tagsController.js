const Tag = require('../models/tags');
const Question = require('../models/questions');


// checks if tag exists before adding a new one
exports.createTag = async (req, res) => {
 const { name } = req.body; // this is the tag name passed from axios in app.js
 try {
   let tag = await Tag.findOne({ name: name.toLowerCase() }); // if there's already a tag with that tag name, set it equal to tag. otherwise it is null


   if (!tag) { // if no tag name found in collection, create a tag with the name
     tag = new Tag({ name: name.toLowerCase() });
     await tag.save(); // responsible for actually storing the new tag in the database
   }


   res.status(201).json(tag); // sends the created or found tag back to the client in JSON format. allows the client to immediately use the details of the tag, including its database-generated ID
 } catch (error) {
   res.status(500).send(error.message);
 }
};




// returns list of elements. each containing the tag name, _id, & questionCount
exports.getAllTags = async (req, res) => {
   try {
     // use aggregation to count questions per tag
     const tagsWithCount = await Tag.aggregate([
       {
         $lookup: {
           from: 'questions', // the collection to join
           let: { tagId: '$_id' }, // define a variable `tagId` to use in the pipeline
           pipeline: [
             { $unwind: '$tags' }, // deconstruct the tags array
             { $match: { $expr: { $eq: ['$tags', '$$tagId'] } } }, // match the tags in questions with the current tag
             { $count: 'questionCount' } // count the matches
           ],
           as: 'questionCountArr' // resulting count is an array
         }
       },
       {
         $addFields: {
           questionCount: { $ifNull: [{ $arrayElemAt: ['$questionCountArr.questionCount', 0] }, 0] } // extract count or 0 if not present
         }
       },
       { $project: { questionCountArr: 0 } } // remove the questionCountArr field
     ]);
      res.json(tagsWithCount); // send the tags with their question counts
   } catch (error) {
     res.status(500).send(error.message);
   }
 };


 // takes in a tag id. returns tag name corresponding to id
 exports.getTagById = async (req, res) => {
   try {
     const tag = await Tag.findById(req.params.id);
     if (!tag) {
       return res.status(404).send('Tag not found');
     }
     res.json(tag);
   } catch (error) {
     res.status(500).send(error.message);
   }
 };
