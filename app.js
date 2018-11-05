const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/campground_app", {useNewUrlParser: true});

//tell express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set("view engine", "ejs");


//SCHEMA SETUP
const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//   {
//     name: "Crystal Cove State Park", 
//     image: "https://img.hipcamp.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1506230132/campground-photos/zgxxiekyx0bj2sk6zt6n/tent_picnic-table_lodging_rusty-hill-farm-homestead.jpg"
//   }, function(err, campground) {
//     if (err) console.log("There is an error in creating a campground: ", err);
//     else console.log("New Campground created: ");
//   }
// )

// Campground.create(
//   {
//     name: "Yosemite National Park", 
//     image: "https://img.hipcamp.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1530031475/campground-photos/xqocbthdsyi8vd6e3wi8/enchanted-forest-cosmo-campsite.jpg"
//   }, function(err, campground) {
//     if (err) console.log("There is an error in creating a campground: ", err);
//     else console.log("New Campground created: ");
//   }
// )

app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/campgrounds", function(req, res) { 
  //get all the campgrounds from DB
  Campground.find({}, function(err, allCampgrounds) {
    if (err) console.log("There is an error in getting all the campgrounds: ", err);
      else res.render("campgrounds", {campgrounds: allCampgrounds});
  });
  
});

app.post("/campgrounds", function(req, res) {
  let name = req.body.name;
  let image = req.body.image;
  let newCampground = {name: name, image: image};
  Campground.create(newCampground, function(err) {
    if (err) console.log("There was an error in creating a new campground: ", err);
    else {
      console.log("Successfully created a new campground");
      res.redirect("/campgrounds");
    }
  });  
});

app.get("/campgrounds/new", function(req, res) {  
  res.render("new");
});

app.get("*", function(req, res) {
  res.render("other")
})

//removes extra copies that get created when save button is
// Campground.deleteMany({}, function(err) {
//   if (err) console.log("There was an error in deleting all the campgrounds: ", err);
//   else console.log("The Campground collection has been deleted");
// });

app.listen(3003, function(req, res) {
  console.log("I am listening on port 3003");
});