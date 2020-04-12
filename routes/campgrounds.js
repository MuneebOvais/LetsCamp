var express=require("express"),
    router=express.Router(),
    Campground=require("../models/campground"),
    Comment=require("../models/comment");
    middleware=require("../middleware");//no need to mention index.js in path as it's special

//MULTER AND CLOUDINARY CONFIGURATION
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname); //creating custome name for uploaded image
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) { //only files with these extensions are allowed
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'lord-muneeb', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    //upload file to cloudinary
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('/campgrounds');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, foundCampground){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("/campgrounds");
        } else {
            if (req.file) { //if user uploaded file
              try {
                  await cloudinary.v2.uploader.destroy(foundCampground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  foundCampground.imageId = result.public_id;
                  foundCampground.image = result.secure_url;
                } catch(err) {
                    req.flash("error", "Something went wrong.");
                    res.redirect("/campgrounds");
                }
            }
            foundCampground.name = req.body.campground.name;
            foundCampground.description = req.body.campground.description;
            foundCampground.price=req.body.campground.price;
            foundCampground.save();
            req.flash("success","Successfully updated campground.");
            res.redirect("/campgrounds/" + foundCampground._id);
        }
    });
});
// DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async function(err, foundCampground){
        if(err){
            req.flash("err", "Something went wrong.");
            return res.redirect("/campgrounds");
        }
        //found all comments on that campground and delete them
        foundCampground.comments.forEach(function(comment){
            Comment.findByIdAndRemove(comment, function(err){
                if(err){
                    req.flash("err", "Something went wrong.");
                    return res.redirect("/campgrounds");
                }
            });
        });
        //now delete image from cloudinary and delete camoground from mongo
        try {
            await cloudinary.v2.uploader.destroy(foundCampground.imageId);
            foundCampground.remove();
            req.flash('success', 'Campground deleted successfully!');
            res.redirect('/campgrounds');
        } catch(err) {
            if(err) {
              req.flash("error", "Something went wrong");
              return res.redirect("/campgrounds");
            }
        }
    });
});

module.exports=router;