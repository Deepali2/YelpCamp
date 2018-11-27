const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      User       = require("../models/user"),
      Campground = require("../models/campground"),
      async      = require("async"),
      nodemailer = require("nodemailer"),
      crypto     = require("crypto");

//ROUTES
router.get("/", function(req, res) {
  res.render("./users/landing");
});

//==================
//AUTH ROUTES
//==================

//Register ROUTES
//show register form
router.get("/register", function(req, res) {
  res.render("./users/register");
});

//handling user registration
router.post("/register", function(req, res) {
  const newUser = new User({username: req.body.username, email: req.body.email});
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
  res.render("./users/login");
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
  req.flash("success", "See You Later!");
  res.redirect("/campgrounds");
});

//FORGOT PASSWORD ROUTES
router.get("/forgot", function(req, res) {
  res.render("./users/forgot");
});

//HANDLE RESET PASSWORD
router.post("/forgot", function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({email: req.body.email}, function(err, user) {
        if (!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/forgot");
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; //1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {      
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "deepaligarg251@gmail.com",
          pass: process.env.GMAILPW
          
        }
      });
      const mailOptions = {
        to: user.email,
        from: "deepaligarg251@gmail.com",
        subject: "Password Reset",
        text: "You are receiving this because you(or someone else) " +
        "have requested the reset of your password. Please click on " +
        "the following link, or paste this into your browser to " +
        "complete the process." + "\n\n" +
        "https://" + req.headers.host + "/reset/" + token + "\n\n" +
        "If you did not request this, please ignore this email and your password " +
        "will remain unchanged."
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log("mail sent");
        req.flash("success", "An e-mail has been sent to " + user.email + "with further instructions.");
        done(err, "done");
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

//EDIT USER ROUTE
router.get("/users/:id/edit", function(req, res) {  
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      res.render("./users/editUser", {user: foundUser});
    }
  });  
});

//UPDATE USER ROUTE
// router.put("/users/:id", function(req, res) { 
//   console.log("req.params.id is: ", req.params.id);
//   console.log("req.body is: ", req.body);
  
//   User.findByIdAndUpdate(req.params.id, req.body.username, function(err, updatedUser) {

//     if(err) {
//       req.flash("error", "Something went wrong");
//       res.redirect("/users/:id/edit");
//     }
//     else {
//       req.flash("success", "Your account information has been updated");
//       res.redirect("/users/:id/edit");
//     }
//   });
// });

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