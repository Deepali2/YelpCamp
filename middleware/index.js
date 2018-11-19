const Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      ObjectId   = require("mongodb").ObjectID;


//all the middleware goes here
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
  //authorization: is the user logged in
  if (req.isAuthenticated()) {    
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err || !foundCampground) {
        console.log("in the if route:", foundCampground);
        req.flash("error", "Campground not found");        
        res.redirect("back");
      }
      else {
        console.log("in the else route", foundCampground);
        //does the user own the campground?
        if(foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have the right permissions to do that!");
          res.redirect("back");
        }        
      }
    });
  } else {
    req.flash("error", "You have to be logged in!");
    res.redirect("back");
  } 
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
  //authorization: is the user logged in
  if (req.isAuthenticated()) {    
    Comment.find({"_id": ObjectId(req.params.comment_id)}, function(err, foundComment) {
      if (err) {
        console.log(err);
        res.redirect("back");
      }
      else {
        //does the user own the comment?
        if(foundComment[0].author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have permission to do that");
          res.redirect("back");
        }        
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  } 
}

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
}


module.exports = middlewareObj;