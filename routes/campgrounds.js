const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      ObjectId   = require("mongodb").ObjectID;


//INDEX route - show all campgrounds
router.get("/", function(req, res) { 
  //get all the campgrounds from DB
  Campground.find({}, function(err, allCampgrounds) {
    if (err) console.log("There is an error in getting all the campgrounds: ", err);
      else res.render("campgrounds/campgrounds", {campgrounds: allCampgrounds});
  });
  
});

//CREATE route - add new campground to database
router.post("/", function(req, res) {  
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
router.get("/new", function(req, res) {  
  res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {  
  Campground.find({"_id": ObjectId(req.params.id)}).populate("comments").exec(function(err, foundCampground) {
    if (err) console.log("Error in getting More Info: ", foundCampground);
    else {      
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });  
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}


module.exports = router;
