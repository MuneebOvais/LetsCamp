var express=require("express"),
    router=express.Router({mergeParams: true}),
    Campground=require("../models/campground"),
    Comment=require("../models/comment"),
    middleware=require("../middleware");

// NEW COMMENT
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else{
            res.render("comments/new", {campground: foundCampground});
        }
    });
});
// CREATE COMMENT
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, foundCampground){
        //create new comment
        Comment.create(req.body.comment, function(err, createdComment){
            //add username and id to comment
            createdComment.author.id=req.user._id;
            createdComment.author.username=req.user.username
            //save comment
            createdComment.save(function(err, savedComment){
                if(err){
                    req.flash("err", "Something went wrong.");
                    res.redirect("/campgrounds");
                } else {
                    //connect new comment to campground
                    foundCampground.comments.push(createdComment);
                    foundCampground.save(function(err, savedCampground){
                        if(err){
                            req.flash("err", "Something went wrong.");
                            res.redirect("/campgrounds");
                        } else {
                            res.redirect("/campgrounds/" + req.params.id);
                        }
                    });
                }
            });
        });
    });
});
// EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground Not found");
            return res.redirect("/campgrounds");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else{
                res.render("comments/edit", {campground: foundCampground, comment: foundComment});
            }
        });
    });
});
// UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, editedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});
//DESTROY COMMENT
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //delete comment reference from campground model
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("err", "Something went wrong.");
            res.redirect("/campgrounds");
        } else {
            foundCampground.comments.splice(foundCampground.comments.indexOf(req.params.comment_id.toString()), 1);
            foundCampground.save();
        }
    });
    //delete comment
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports=router;