const mongoose = require("mongoose");

//SCHEMA setup
const commentSchema = new mongoose.Schema({
  text: String,
  author: String
});


module.exports = mongoose.model("Comment", commentSchema);