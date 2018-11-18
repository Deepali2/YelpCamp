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
router.post("/", isLoggedIn, function(req, res) {
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
      console.log("Successfully created a new campground");
      res.redirect("/campgrounds");
    }
  });  
});

//NEW route - Show form to create a new campground
router.get("/new", isLoggedIn, function(req, res) {  
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

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkCampgroundOwnership, function(req, res) {
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, foundCampground) {
    res.render("campgrounds/edit", {campground: foundCampground});  
  });    
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res) {
  //find and update the correct campground
  Campground.findOneAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });  
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", function(req, res) {
  Campground.findOneAndDelete(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);      
    } 
    res.redirect("/campgrounds");
  });
});

//middlewares
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
  //authorization: is the user logged in
  if (req.isAuthenticated()) {    
    Campground.find({"_id": ObjectId(req.params.id)}, function(err, foundCampground) {
      if (err) {
        console.log(err);
        res.redirect("back");
      }
      else {
        //does the user own the campground?
        if(foundCampground[0].author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }        
      }
    });
  } else {
    res.redirect("back");
  } 
}


module.exports = router;
