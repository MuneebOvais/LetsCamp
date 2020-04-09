var express=require("express"),
    router=express.Router(),
    passport=require("passport"),
    User=require("../models/user");

//  ROOT ROUTE
router.get("/", function(req, res){
    res.render("landing");
});
//  ===========
//  AUTH ROUTES
//  ===========
// Show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});
// Handle sign up logic
router.post("/register", function(req, res){
    var newUser=new User({username: req.body.username});
    if(req.body.adminCode === 'secretcode123'){
        newUser.isAdmin=true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){   // if can't register then again go to register
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){ //if authenticated, then go to campgrounds
            req.flash("success", "Signed Up successfully");
            res.redirect("/campgrounds");
        });
    });
});
// Show Login Form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});
// Handle Login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req, res){
});
// Logout logic
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

module.exports=router;