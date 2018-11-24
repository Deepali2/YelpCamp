const express               = require("express"),
      app                   = express(),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      flash                 = require("connect-flash"),
      faker                 = require("faker"),
      loremIpsum            = require("lorem-ipsum"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      methodOverride        = require("method-override"),
      // passportLocalMongoose = require("passport-local-mongoose"),
      ObjectId              = require("mongodb").ObjectID,
      Campground            = require("./models/campground"),
      seedDB                = require("./seeds"),
      User                  = require("./models/user"),
      Comment               = require("./models/comment");

//requiring routes
const commentRoutes    = require("./routes/comments"),
      campgroundRoutes = require("./routes/campgrounds"),
      authRoutes       = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/campground_app", {useNewUrlParser: true});

//tell express to use body-parser and other middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash()); //must come before passport configuration

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
  res.locals.error = req.flash("error"); //flash message
  res.locals.success = req.flash("success"); //flash message
  next();
});

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

//seeding the database
// seedDB();

app.listen(process.env.PORT||3003, function(req, res) {
  console.log("I am listening on port 3003");
});