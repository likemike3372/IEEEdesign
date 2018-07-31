var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");


//root route
router.get("/news", function(req, res) {
    res.render("all");
})


router.get("/",function(req, res){
    res.render("landing");
    
});



//============================
//AUTH ROutes
//============================

//show register form
router.get("/register", function(req, res) {
    
    res.render("register",{page:"register"});
    
});

//sign up logic
router.post("/register", function(req, res) {
    
    var newuser=new User({username:req.body.username});
    
    User.register(newuser,req.body.password, function(err,user){
        if(err)
        {   
            req.flash("error",err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to IEEE "+user.username);
           res.redirect("/events"); 
        });
    });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login",{page:"login"});
});


//handling login logic
//app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", 
        {successRedirect:"/events",
         failureRedirect:"/login"    
        }), 
        function(req, res) {
    
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/events");
});




module.exports=router;
