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

//EDIT COMMENTS ROUTE
router.get("/:comment_id/edit", function(req, res) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err) {
      console.log(err);
      res.redirect("back");
    }
    else {
      res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    }
  });
  
});

//UPDATE COMMENTS ROUTE
router.put("/:comment_id", function(req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
    if(err) res.redirect("back");
    else res.redirect("/campgrounds/" + req.params.id);
  });
});

//DESTROY COMMENTS ROUTE
router.delete("/:comment_id", function(req, res) {
  Comment.findByIdAndDelete(req.params.comment_id, function(err) {
    if (err) res.redirect("back");
    else res.redirect("/campgrounds/" + req.params.id);
  });  
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;