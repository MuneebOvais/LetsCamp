var express=require("express"),
    router=express.Router(),
    Campground=require("../models/campground"),
    Comment=require("../models/comment");
    middleware=require("../middleware");//no need to mention index.js in path as it's special

//INDEX - show all campgrounds
router.get("/", function(req, res){
    //get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
        }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    var newCampground=req.body.campground;
    newCampground.author={
        id: req.user._id,
        username: req.user.username
    };
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundcampGround){
        if(err || !foundcampGround){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", {campground: foundcampGround});
        }
    });
});
// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});
// UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, editedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
// DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //found all comments on that campground and delete them
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("err", "Something went wrong.");
            res.redirect("/campgrounds");
        } else {
            foundCampground.comments.forEach(function(comment){
                Comment.findByIdAndRemove(comment, function(err){
                    if(err){
                        req.flash("err", "Something went wrong.");
                        res.redirect("/campgrounds");
                    }
                });
            });
        }
    });
    //now delete campground
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports=router;