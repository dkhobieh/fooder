var express = require("express");
var router = express.Router();
var Meal = require("../models/meal");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//index -- show all meals
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all meals from DB
    Meal.find({name: regex}, function(err, allMeals){
        if(err) {
            console.log(err);
        } else {
            if(allMeals.length < 1) {
                 noMatch = "No meal match that search, please try again.";
            } 
            res.render("meals/index", {meals: allMeals, currentUser: req.user, page: "meals", noMatch: noMatch});
        }
    });
} else {
    // Get all meals from DB
    Meal.find({}, function(err, allMeals){
        if(err) {
            console.log(err);
        } else {
            res.render("meals/index", {meals: allMeals, currentUser: req.user, page: "meals", noMatch: noMatch});
        }
    });
}
    
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var user = {
      id: req.user._id,
      username: req.user.username
  };
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newMeal = {name: name, price: price, image: image, description: desc, user: user, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Meal.create(newMeal, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/meals");
        }
    });
  });
});

//new -- show form to create new meal
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("meals/new");
});

// SHOW - shows more info about one meal
router.get("/:id", function(req, res){
    // find the meal with provided id
    Meal.findById(req.params.id).populate("comments").exec(function(err, foundMeal) {
        if(err) {
            console.log(err);
        } else {
             // render show template with that meal
            res.render("meals/show", {meal: foundMeal});
        }
    });
    // req.params.id

});

//edit meal route
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res){
    Meal.findById(req.params.id,function(err, foundMeal){
        res.render("meals/edit", {meal: foundMeal});
      });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkPostOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.meal.lat = data[0].latitude;
    req.body.meal.lng = data[0].longitude;
    req.body.meal.location = data[0].formattedAddress;

    Meal.findByIdAndUpdate(req.params.id, req.body.meal, function(err, meal){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/meals/" + meal._id);
        }
    });
  });
});

//delete meal route
router.delete("/:id", middleware.checkPostOwnership, function(req, res){
    Meal.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/meals");
         } else {
             res.redirect("/meals");
         }
});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;