var express=require('express'),
    app=express(),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    Campground=require("./models/campground"),
    Comment=require("./models/comment"),
    User=require("./models/user");
    seedDB=require("./seeds"),
    methodOverride=require("method-override"),
    flash=require("connect-flash");

// Requiring routes
var campgroundRoutes=require("./routes/campgrounds"),
    commentRoutes=require("./routes/comments"),
    indexRoutes=require("./routes/index");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// mongoose.connect('mongodb://localhost:27017/letscamp', {useNewUrlParser: true, useUnifiedTopology: true}); //Create and use DB
mongoose.connect('mongodb+srv://MuneebOvaisKhan:6027proudubitian@cluster0-fprba.mongodb.net/letscamp', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set('useFindAndModify', false);
 
//MOMENT CONFIGURATION
app.locals.moment=require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Shhh!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Another middleware
app.use(function(req, res, next){
    res.locals.currentUser=req.user; // make req.user(info of logged in user) available to each template (ejs)
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success"); // make message available to each template
    next(); // to proceed to the call-back function of route
});

// seedDB(); // Seed the db
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || "1003", "0.0.0.0", function(){
    console.log("Server started at port 1003");
});
