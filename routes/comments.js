var express = require("express");
var router = express.Router({mergeParams: true});
var Meal = require("../models/meal");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find meal by id
    Meal.findById(req.params.id, function(err, meal){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {meal: meal});
        }
    })
});

//comments create
router.post("/", middleware.isLoggedIn, function(req, res){
    //llokup meal using ID
    Meal.findById(req.params.id, function(err, meal){
        if(err) {
            console.log(err);
            res.redirect("/meals");
        } else {
            //create a new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    //connect the new comment to meal
                    meal.comments.push(comment);
                    meal.save();
                    //redirect to meal show page
                    req.flash("success", "Comment created");
                    res.redirect("/meals/" + meal._id);
                }
            })
        }
    });
    
});

//commet edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {meal_id: req.params.id, comment: foundComment});
        }
    });
});

//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/meals/" + req.params.id);
        }
    });
});

//comment delete route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/meals/" + req.params.id);
        }
    });
});





module.exports = router;