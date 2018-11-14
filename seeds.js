const mongoose = require("mongoose");
const Campground = require("./models/campground");
const loremIpsum = require("lorem-ipsum");
const Comment = require("./models/comment");

const data =[
  {
    name: "Crystal Cove State Park",
    image: "https://img.hipcamp.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1506230132/campground-photos/zgxxiekyx0bj2sk6zt6n/tent_picnic-table_lodging_rusty-hill-farm-homestead.jpg",
    description: loremIpsum({count: 20, units: "sentences"}),
  },
  {
    name: "Yosemite National Park", 
    image: "https://img.hipcamp.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1530031475/campground-photos/xqocbthdsyi8vd6e3wi8/enchanted-forest-cosmo-campsite.jpg",
    description: loremIpsum({count: 20, units: "sentences"}),
  },
  {
    name: "The Lost Coast", 
    image: "https://pixabay.com/get/e03db50f2af41c22d2524518b7444795ea76e5d004b0144597f1c77da1ecbc_340.jpg",
    description: loremIpsum({count: 20, units: "sentences"}),
  }
];

function seedDB() {
  //Remove all campgrounds
  Campground.deleteMany({}, function(err) {
    if (err) console.log(err);
    else {
      console.log("Removed campgrounds");
      //add a few campgrounds
      data.forEach(function(seed) {
        Campground.create(seed, function(err, campground) {
          if (err) console.log(err);
          else {
            console.log("Added a campground");
             //create a comment
            Comment.create(
              {
                text: loremIpsum({count: 1, units: "sentences"}),
                author: "Homer"
              }, function(err, comment) {
                if (err) console.log(err);
                else {
                  campground.comments.push(comment);
                  campground.save();
                  console.log("created a new comment");
                }
              }
            );
          }
        });
      });
    }
  });  
}

module.exports = seedDB;

