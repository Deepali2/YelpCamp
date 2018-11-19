const Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      ObjectId   = require("mongodb").ObjectID;


//all the middleware goes here
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
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
          res.redirect("back");
        }        
      }
    });
  } else {
    res.redirect("back");
  } 
}

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}


module.exports = middlewareObj;