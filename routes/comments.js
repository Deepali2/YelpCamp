const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      ObjectId   = require("mongodb").ObjectID;
//====================
//COMMENTS ROUTES
//====================

//NEW ROUTE
router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
  //find campground by id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
    if (err) console.log(err);
    else {         
      res.render("comments/new", {campground: campground});
    }
  });  
});

//CREATE ROUTE
router.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {  
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

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;