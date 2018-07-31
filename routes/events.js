var express=require("express");
var router=express.Router();
var Event=require("../models/event");
var middleware=require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//show form to create new event
router.get("/new",middleware.isLoggedIn, function(req, res) {
   res.render("events/new"); 
});


//INDEX Route
router.get("/", function(req, res){
        //Get all campgrounds from DB
        Event.find({},function(err, allCampgrounds){
            if(err){
                console.log(err);
            }
            else{
                        res.render("events/index",{campgrounds:allCampgrounds, page:"events"});
                        
            }
        });
});

//CREATE - add new event to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to event array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var price=req.body.price;
  var created=req.body.date;
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newEvent = {name: name, image: image,price:price, description: desc, author:author, location: location, lat: lat, lng: lng,created:created};
    // Create a new event and save to DB
    Event.create(newEvent, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to events page
            console.log(newlyCreated);
            res.redirect("/events");
        }
    });
  });
});

router.get("/:id", function(req, res) {
    //find the Event with provided ID
    Event.findById(req.params.id).populate("comments").exec(function(err, foundEvent){
        if(err){
            console.log(err);
        }else{
                console.log(foundEvent);
                
                //render show template with that Event
                res.render("events/show", {campground:foundEvent});
        }
    });
    });
    
//EDIT Event Route
router.get("/:id/edit", middleware.checkeventownership, function(req, res){
    
      Event.findById(req.params.id, function(err, foundEvent){
         res.render("events/edit",{campground:foundEvent});

              
           
      });
    });
    
    
    //otherwise, redirect
    //if not, redirect
   
    

// UPDATE Event ROUTE
router.put("/:id", middleware.checkeventownership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Event.findByIdAndUpdate(req.params.id, req.body.campground, function(err, event){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/events/" + event._id);
        }
    });
  });
});
    
//Destroy Event
router.delete("/:id", middleware.checkeventownership,function(req, res){
    Event.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/events");
       } 
       else{
           res.redirect("/events");
       }
    });
});
    

    

module.exports=router;