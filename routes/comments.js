const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      ObjectId   = require("mongodb").ObjectID,
      // today      = require("../date.js"),
      middleware = require("../middleware");// since the file is names index.js, we do not need to write middleware/index.js


//NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res) {
  //find campground by id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
    if (err) console.log(err);
    else {         
      res.render("comments/new", {campground: campground});
    }
  });  
});

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res) {  
  // lookup campground using id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
     if (err) {
       console.log(err);
       res.redirect("/campgrounds");
     }
     else {
       //create a new comment
       Comment.create(req.body.comment, function(err, comment) {
         if (err) req.flash("error", "Something went wrong");
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
           req.flash("success", "Successfully added comment");
           res.redirect("/campgrounds/" + campground[0]._id);
         }
       });
     }
  });   
  //redirect campground show page
});

//EDIT COMMENTS ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash("error", "No such Campground");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {      
        res.redirect("back");
      }
      else {
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
    });
  });  
});

//UPDATE COMMENTS ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
    if(err) res.redirect("back");
    else res.redirect("/campgrounds/" + req.params.id);
  });
});

//DESTROY COMMENTS ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndDelete(req.params.comment_id, function(err) {
    if (err) res.redirect("back");
    else {
      req.flash("success", "Comment deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });  
});

module.exports = router;