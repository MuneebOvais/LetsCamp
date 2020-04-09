var Campground=require("../models/campground"),
    Comment=require("../models/comment"),
    middlewareObj={};

middlewareObj.checkCampgroundOwnership=function(req, res, next){
    if(req.isAuthenticated()){ // is user logged in?
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                //if someone edits id of campground from browser in EDIT route
                req.flash("error", "Campground not found");
                res.redirect("/campgrounds");
            } else {
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){ // is user authorized to make changes?
                    return next();
                }
                else{
                    //if unauthorized user goes to EDIT route of capground
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("/campgrounds");
                }
            }
        });
    } else {
        req.flash("error", "Please Login first.");
        res.redirect("/login");
        }
    };

middlewareObj.checkCommentOwnership=function(req, res, next){
    if(req.isAuthenticated()){ // is user logged in?
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("/campgrounds");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){ // is user authorized to make changes?
                    return next();
                }
                else{
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login first.");
        res.redirect("/login");
    }
};

middlewareObj.isLoggedIn=function(req, res, next){
    if(req.isAuthenticated()){
        next();
    } else {
        req.flash("error", "Please Login first.");
        res.redirect("/login");
    }
};

module.exports=middlewareObj;