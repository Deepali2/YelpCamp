const express  = require("express"),
      router   = express.Router(),
      passport = require("passport"),
      User     = require("../models/user");

//ROUTES
router.get("/", function(req, res) {
  res.render("landing");
});

//==================
//AUTH ROUTES
//==================

//Register ROUTES
//show register form
router.get("/register", function(req, res) {
  res.render("register");
});

//handling user registration
router.post("/register", function(req, res) {
  const newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user) {
    if(err) {
      console.log(err);      
      // return res.render("register", {"error": err.message});
      req.flash("error", err.message);
      return res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/campgrounds");
      });
    }
  });
});

//LOGIN ROUTES
//show login form
router.get("/login", function(req, res) {
  res.render("login");
});
//handle user login
router.post("/login", passport.authenticate("local", 
  {
  successRedirect: "/campgrounds",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: "Welcome to YelpCamp!"
  }), function(req, res) {
});

//LOGOUT ROUTE
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/campgrounds");
});

//EDIT USER ROUTE
router.get("/users/:id/edit", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      res.render("editUser", {user: foundUser});
    }
  });  
});

//UPDATE USER ROUTE
router.put("/users/:id", function(req, res) { 
  console.log("req.params.id is: ", req.params.id);
  console.log("req.body.username is: ", req.body.username);
  
  User.findByIdAndUpdate(req.params.id, req.body.username, function(err, updatedUser) {
    if(err) {
      req.flash("error", "Something went wrong");
      res.redirect("/users/:id/edit");
    }
    else {
      req.flash("success", "Your account information has been updated");
      res.redirect("/users/:id/edit");
    }
  });
});

//DESTROY ROUTE for USER
router.delete("/users/:id", function(req, res) {
  User.findByIdAndDelete(req.params.id, function(err, user) {
    if (err) {
      console.log("Error in deleting user: ", err);
      res.redirect("/users/:id")
    } else {
      req.flash("success", "Your user account has been deleted");
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;