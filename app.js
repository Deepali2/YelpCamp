const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const faker = require("faker");
const loremIpsum = require("lorem-ipsum");
const ObjectId = require("mongodb").ObjectID;
const Campground = require("./models/campground");
const seedDB = require("./seeds");
// const Comment = require("./models/comment");
// const User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/campground_app", {useNewUrlParser: true});

//tell express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set("view engine", "ejs");


seedDB();

app.get("/", function(req, res) {
  res.render("landing");
});

//INDEX route - show all campgrounds
app.get("/index", function(req, res) { 
  //get all the campgrounds from DB
  Campground.find({}, function(err, allCampgrounds) {
    if (err) console.log("There is an error in getting all the campgrounds: ", err);
      else res.render("index", {campgrounds: allCampgrounds});
  });
  
});

//CREATE route - add new campground to database
app.post("/index", function(req, res) {
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let newCampground = {name: name, image: image, description: desc};
  Campground.create(newCampground, function(err) {
    if (err) console.log("There was an error in creating a new campground: ", err);
    else {
      console.log("Successfully created a new campground");
      res.redirect("/index");
    }
  });  
});

//NEW route - Show form to create a vew campground
app.get("/campgrounds/new", function(req, res) {  
  res.render("new");
});

//SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res) {  
  Campground.find({"_id": ObjectId(req.params.id)}).populate("comments").exec(function(err, foundCampground) {
    if (err) console.log("Error in getting More Info: ", foundCampground);
    else {
      console.log(foundCampground);
      res.render("show", {campground: foundCampground});
    }
  });
  
});

//for any other path
app.get("*", function(req, res) {
  res.render("other");
});
  


//removes extra copies that get created when save button is
// Campground.deleteMany({}, function(err) {
//   if (err) console.log("There was an error in deleting all the campgrounds: ", err);
//   else console.log("The Campground collection has been deleted");
// })

app.listen(3003, function(req, res) {
  console.log("I am listening on port 3003");
});