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
      return res.render("register");
    } else {
      passport.authenticate("local")(req, res, function() {
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
  failureRedirect: "/login"
  }), function(req, res) {
});

//LOGOUT ROUTE
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}



module.exports = router;