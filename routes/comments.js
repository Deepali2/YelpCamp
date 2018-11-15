const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      ObjectId   = require("mongodb").ObjectID;


//NEW ROUTE
router.get("/new", isLoggedIn, function(req, res) {
  //find campground by id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
    if (err) console.log(err);
    else {         
      res.render("comments/new", {campground: campground});
    }
  });  
});

//CREATE ROUTE
router.post("/", isLoggedIn, function(req, res) {  
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
           //add username and id to comment
           comment.author.id = req.user._id;
           comment.author.username = req.user.username;
           //save the comment
           comment.save();
           //connect the new comment to campground
           campground[0].comments.push(comment);
           campground[0].save();
           console.log(comment);
           res.redirect("/campgrounds/" + campground[0]._id);
         }
       });
     }
  });   
  //redirect campground show page
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;