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
  console.log(req.body);
  const newUser = new User(//req.body
    {
    username: req.body.username, 
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar,
    aboutAuthor: req.body.aboutAuthor
    }
  );
  // eval(require("locus"));
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
//GET THE FORGOT PASSWORD FORM
router.get("/forgot", function(req, res) {
  res.render("./users/forgot");
});

//HANDLE SENDING EMAIL TO RESET PASSWORD
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
      console.log(process.env.GMAILPW);    
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "deepali.noreply@gmail.com",
          pass: process.env.GMAILPW
          
        }
      });
      const mailOptions = {
        to: user.email,
        from: "deepali.noreply@gmail.com",
        subject: "YelpCamp Password Reset",
        text: "You are receiving this because you(or someone else) " +
        "have requested the reset of your password for YelpCamp. Please click on " +
        "the following link, or paste this into your browser to " +
        "complete the process." + "\n\n" +
        "http://" + req.headers.host + "/reset/" + token + "\n\n" +
        "If you did not request this, please ignore this email and your password " +
        "will remain unchanged."
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log("mail sent");
        req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

//GET THE RESET PASSWORD FORM
router.get("/reset/:token", function(req, res) {  
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user) {
    if(!user) {
      req.flash("error", "Password Reset Token is invalid or has expired.");
      return res.redirect("/forgot");
    } 
    console.log(req.params.token);
    res.render("reset", {token: req.params.token});
  });    
});

//POST ROUTE FOR THE NEW PASSWORD
router.post("/reset/:token", function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires:{ $gt: Date.now()}}, function(err, user) {
        if(!user) {
          req.flash("error", "Password reset token is invalid or expired.");
          return res.redirect("back");
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect("back");
        }
      });
    },
    function(user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "deepali.noreply@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      const mailOptions = {
        to: user.email,
        from: "deepali.noreply@gmail.com",
        subject: "Your YelpCamp password has been changed",
        text: `Hello, \n\n
          This is a confirmation that the password for your YelpCamp account
          ${user.email} has just been changed.`
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash("success", "Your password has been changed.");
        done(err);
      });
    }
  ], function(err) {
    res.redirect("/campgrounds");
  });
});

//USER PROFILE
router.get("/users/:id", function(req,res) {  
  User.findById(req.params.id, function(err, foundUser) {    
    if ( !foundUser || err) {
      req.flash("error", "This user no longer exists");
      return res.redirect("/");
    } 
    console.log("foundUser is: ", foundUser);
    console.log("foundUser._id is: ", foundUser._id);
    console.log("Campground.find() is: ", Campground.find());
    
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
    // Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
      console.log("campgrounds is: ", campgrounds);
      if (err) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
      }  
      res.render("../views/users/show", {user: foundUser, campgrounds: campgrounds});     
    })  
    
  });
  
});



//EDIT USER ROUTE
router.get("/users/:id/edit", function(req, res) {  
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      res.render("./views/users/editUser", {user: foundUser});
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