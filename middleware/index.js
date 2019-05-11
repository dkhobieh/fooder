var Meal = require("../models/meal");
var Comment = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

middlewareObj.checkPostOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
         
        Meal.findById(req.params.id,function(err, foundMeal){
         if(err){
             req.flash("error", "Meal not found");
            res.redirect("back");
         } else {
            //does user own the post?
            if(foundMeal.user.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "Permission Denied");
                res.redirect("back");
            }
         }
      });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
      if(req.isAuthenticated()){
         
        Comment.findById(req.params.comment_id,function(err, foundComment){
         if(err){
            res.redirect("back");
         } else {
            //does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
             } else {
                 req.flash("error", "Permission Denied");
                 res.redirect("back");
            }
          }
      });
    } else {
        req.flash("error", "Please log in first!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to post");
    res.redirect("/login");
}



module.exports = middlewareObj 