const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      ObjectId   = require("mongodb").ObjectID,
      middleware = require("../middleware");// since the file is names index.js, we do not need to write middleware/index.js


//INDEX route - show all campgrounds
router.get("/", function(req, res) { 
  //get all the campgrounds from DB
  Campground.find({}, function(err, allCampgrounds) {
    if (err) console.log("There is an error in getting all the campgrounds: ", err);
      else res.render("campgrounds/campgrounds", {campgrounds: allCampgrounds});
  });  
});

//CREATE route - add new campground to database
router.post("/", middleware.isLoggedIn, function(req, res) {
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let author = {
    id: req.user._id,
    username: req.user.username
  }
  let newCampground = {name: name, image: image, description: desc, author: author};
  Campground.create(newCampground, function(err, newlyCreated) {    
    if (err) console.log("There was an error in creating a new campground: ", err);
    else {
      // newCampground.author.id = req.user._id;
      // newCampground.author.username = req.user.username;
      res.redirect("/campgrounds");
    }
  });  
});

//NEW route - Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {  
  res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {  
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
    if (err || !foundCampground) {      
      req.flash("error", "Campground not found");
      res.redirect("back");      
    }
    else {      
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });  
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, foundCampground) {
    res.render("campgrounds/edit", {campground: foundCampground});  
  });    
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
  //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if (err) {      
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });  
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndDelete(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);      
    } 
    res.redirect("/campgrounds");
  });
});

module.exports = router;
