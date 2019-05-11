var mongoose  = require("mongoose");
var Meal      = require("./models/meal");
var Comment   = require("./models/comment");

 
var data = [
    {
        name: "Angela's", 
        image: "https://farm1.staticflickr.com/743/21749710009_451e29eaab.jpg",
        description: "Best Fish&Chips in Montreal"
    },
    {
        name: "Soba", 
        image: "https://farm8.staticflickr.com/7671/27719178474_3e0cda6032.jpg",
        description: "Fresh sushi"
    },
    {
        name: "Rayan", 
        image: "https://farm4.staticflickr.com/3481/3990274195_f9f10653a9.jpg",
        description: "Fish all over the place"
    }
]
 
function seedDB(){
   //Remove all meals
   Meal.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed meals!");
        Comment.deleteMany({}, function(err) {
            if(err){
                console.log(err);
            }
             //add a few meals
            data.forEach(function(seed){
                Meal.create(seed, function(err, meal){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added a meal");
                        //create a comment
                        Comment.create(
                            {
                                text: "This place is great, but I wish there was internet",
                                author: "Homer"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    meal.comments.push(comment);
                                    meal.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
                });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;