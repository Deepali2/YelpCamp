const express               = require("express"),
      app                   = express(),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      faker                 = require("faker"),
      loremIpsum            = require("lorem-ipsum"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      ObjectId              = require("mongodb").ObjectID,
      Campground            = require("./models/campground"),
      seedDB                = require("./seeds"),
      User                  = require("./models/user"),
      Comment               = require("./models/comment");


mongoose.connect("mongodb://localhost:27017/campground_app", {useNewUrlParser: true});

//tell express to use body-parser and other middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "It is Yelp Camp Day",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//our own middleware
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//seeding the data
seedDB();

//ROUTES
app.get("/", function(req, res) {
  res.render("landing");
});

//INDEX route - show all campgrounds
app.get("/campgrounds", function(req, res) { 
  //get all the campgrounds from DB
  Campground.find({}, function(err, allCampgrounds) {
    if (err) console.log("There is an error in getting all the campgrounds: ", err);
      else res.render("campgrounds/campgrounds", {campgrounds: allCampgrounds});
  });
  
});

//CREATE route - add new campground to database
app.post("/campgrounds", function(req, res) {  
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let newCampground = {name: name, image: image, description: desc};
  Campground.create(newCampground, function(err) {
    if (err) console.log("There was an error in creating a new campground: ", err);
    else {
      console.log("Successfully created a new campground");
      res.redirect("/campgrounds");
    }
  });  
});

//NEW route - Show form to create a vew campground
app.get("/campgrounds/new", function(req, res) {  
  res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res) {  
  Campground.find({"_id": ObjectId(req.params.id)}).populate("comments").exec(function(err, foundCampground) {
    if (err) console.log("Error in getting More Info: ", foundCampground);
    else {      
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
  
});

//removes extra copies that get created when save button is
// Campground.deleteMany({}, function(err) {
//   if (err) console.log("There was an error in deleting all the campgrounds: ", err);
//   else console.log("The Campground collection has been deleted");
// })

//====================
//COMMENTS ROUTES
//====================

//NEW ROUTE
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
  //find campground by id
  Campground.find({"_id": ObjectId(req.params.id)}, function(err, campground) {
    if (err) console.log(err);
    else {         
      res.render("comments/new", {campground: campground});
    }
  });  
});

//CREATE ROUTE
app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {  
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


//==================
//AUTH ROUTES
//==================

//Register ROUTES
//show register form
app.get("/register", function(req, res) {
  res.render("register");
});

//handling user registration
app.post("/register", function(req, res) {
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
app.get("/login", function(req, res) {
  res.render("login");
});
//handle user login
app.post("/login", passport.authenticate("local", 
  {
  successRedirect: "/campgrounds",
  failureRedirect: "/login"
  }), function(req, res) {
});

//LOGOUT ROUTE
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

//general routes for any other path
app.get("*", function(req, res) {
  res.render("other");
});

app.listen(3003, function(req, res) {
  console.log("I am listening on port 3003");
});