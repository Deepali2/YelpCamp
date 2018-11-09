const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const faker = require("faker");
const loremIpsum = require("lorem-ipsum");
const ObjectId = require("mongodb").ObjectID;
const Campground = require("./models/campground");
const seedDB = require("./seeds");
const Comment = require("./models/comment");
// const User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/campground_app", {useNewUrlParser: true});

//tell express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//seeding the data
seedDB();

//ROUTES
app.get("/", function(req, res) {
  res.render("landing");
});

//INDEX route - show all campgrounds
app.get("/campgrounds", function(req, res) { 
  //get all the campgrounds from DB
  Campground.find({}, function(err, allCampgrounds) {
    if (err) console.log("There is an error in getting all the campgrounds: ", err);
      else res.render("campgrounds/campgrounds", {campgrounds: allCampgrounds});
  });
  
});

//CREATE route - add new campground to database
app.post("/campgrounds", function(req, res) {  
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let newCampground = {name: name, image: image, description: desc};
  Campground.create(newCampground, function(err) {
    if (err) console.log("There was an error in creating a new campground: ", err);
    else {
      console.log("Successfully created a new campground");
      res.redirect("/campgrounds");
    }
  });  
});

//NEW route - Show form to create a vew campground
app.get("/campgrounds/new", function(req, res) {  
  res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res) {  
  Campground.find({"_id": ObjectId(req.params.id)}).populate("comments").exec(function(err, foundCampground) {
    if (err) console.log("Error in getting More Info: ", foundCampground);
    else {      
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
  
});

//removes extra copies that get created when save button is
// Campground.deleteMany({}, function(err) {
//   if (err) console.log("There was an error in deleting all the campgrounds: ", err);
//   else console.log("The Campground collection has been deleted");
// })

//====================
//COMMENTS ROUTES
//====================

//NEW ROUTE
app.get("/campgrounds/:id/comments/new", function(req, res) {
  //find campground by id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
    if (err) console.log(err);
    else {         
      res.render("comments/new", {campground: campground});
    }
  });  
});

//CREATE ROUTE
app.post("/campgrounds/:id/comments", function(req, res) {  
  // lookup campground using id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
     if (err) {
       console.log(err);
       res.redirect("/campgrounds");
     }
     else {
       //create a new comment
       Comment.create(req.body.comment, function(err, comment) {
         if (err) console.log(err);
         else {
           //connect the new comment to campground
           campground[0].comments.push(comment);
           campground[0].save();
           res.redirect("/campgrounds/" + campground[0]._id);
         }
       });
     }
  });   
  //redirect campground show page
});


//for any other path
app.get("*", function(req, res) {
  res.render("other");
});

app.listen(3003, function(req, res) {
  console.log("I am listening on port 3003");
});