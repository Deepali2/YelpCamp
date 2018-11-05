const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/cat_app", {useNewUrlParser: true});



//defining a pattern for our data
let catSchema = new mongoose.Schema({
  name: String,
  age: Number,
  temperament: String
});

//takes the pattern and builds a complex model that has all the methods
//makes a collection called cats. It can pluralize person into people
const Cat = mongoose.model("Cat", catSchema);

const george = new Cat ({
  name: "Mrs. Norris",
  age: 7,
  temperament: "Evil" 
});

//include a callback since the method takes time
george.save(function(err, cat) {
  if(err) console.log("Something went wrong!")
  else console.log("WE JUST SAVED A CAT TO THE DATABASE: ", cat)
});

Cat.create({
  name: "Snow White",
  age: 15,
  temperament: "Bland"
}, function(err, cat) {
  if (err) console.log("Error: , err");
  else console.log(cat);
})

Cat.find({}, function(err, cats) {
  if(err) console.log("Error: ", err)
  else console.log("All the cats: ", cats);
})

Cat.deleteOne({name: "Mrs.Norris"}, function(err) {
  if (err) console.log("Error: ", err);
});

Cat.deleteMany({}, function(err) {
  if (err) console.log("Error in deleting the collection: ", err);
});

Cat.find({}, function(err, cats) {
  if(err) console.log("Error: ", err)
  else console.log("All the cats: ", cats);
})
