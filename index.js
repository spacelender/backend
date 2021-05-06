const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors')
var cookieParser = require('cookie-parser')
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var uniqid = require('uniqid');
const port = 5000;


mongoose = require('mongoose').set('debug', true);
const uri = "mongodb+srv://spacelender:admin123@spacelendermaster.nodha.mongodb.net/spaceLenderDB?retryWrites=true&w=majority";
const dbOptions ={
  useNewUrlParser: true,useUnifiedTopology: true 
}
mongoose.connect(uri,dbOptions).then(() => {  
console.log("Mongoose Connection State : " + mongoose.connection.readyState )
	})

  const app = express()
  app.use(cors())
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());


//connecting to mongodb authentication store
var sessionStore = new MongoDBStore({
  uri: uri,
  collection: 'sessions'
});
sessionStore.on('error', function(error) {
  console.log(error);
});  
app.use(session({secret:"spaceLender2021", 
 resave:false,
 cookie: {
  maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
},
 store: sessionStore,
saveUninitialized:true}));

 
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


const myModels = require('./models.js');
const User = myModels.user
const Space = myModels.space;



app.get("/api/checkForLogin", (req, res) => {
  console.log("root hit")
  if(req.session.alreadyLoggedIn)
  {
    User.findOne({"email":req.session.email}, function(err,user){
    if(err){
      console.log(err);
    }
    else {
      console.log(user);
      res.send(user);
    }
  });

}
else
  {
    res.send("Please login first")
  }
});

app.get("/api/logout", (req, res) => {
 
  req.session.destroy();
  console.log("cookie destroyed, autologin expired")
  res.send("Successfully logged out")
});


app.get("/api/getUserDetailsByMail/:email", (req, res) => {
  User.findOne({"email":req.params.email}, function(err,user){
      if(err){
        console.log(err);
      }
      else {
        console.log(user);
        res.send(user);
      }
    });
});

app.get("/api/getUserDetailsByUUID/:userId", (req, res) => {
  User.findOne({"userId":req.params.userId}, function(err,user){
      if(err){
        console.log(err);
      }
      else {
        console.log(user);
        res.send(user);
      }
    });
});



app.post("/api/login/", (req, res) => {
let email = req.body.email
let pass  = req.body.pass

  User.findOne({"email":email}, function(err,user){
      if(err){
        console.log(err);
        
      }
      else {
        if(user.length==0)
        {
          res.send("User does not exist, Please Sign-Up")
        }
        else if(user.password===pass)
        { 
          req.session.alreadyLoggedIn = true;
          req.session.email = email;
          console.log("save to redis as current authenticated user ?")
          console.log("User successfully logged in,tracking turned on in Cookie")
          res.send("Password match");
        }
        else{
          res.send("Wrong password, Retry Log in");
        }
        
      }
    });
});

app.post("/api/signup/", (req, res) => {
    
  console.log(req.body)
  User.findOne({"email":req.body.email}, function(err,user){
       
    if(err){
      console.log(err);
      
    }
    else {
      if(user==null)
      {

        
        var user = new User({
          email    : req.body.email,
          password : req.body.pass,
          userId   : uniqid(),
          userName : (req.body.userName) ?  req.body.userName : null
        })

        User.create(user, function(err, user) {
          if (err) throw err;
          console.log("New User created");
          console.log(user)
          res.send("Signup Complete");
        });

        req.session.alreadyLoggedIn = true;
        req.session.email = req.body.email;

      }
     else{

      res.send("User already exists with same email");
     }

    }


  }); 
  });


//This is a modular query which will query based on what filters you send in, if you don't send the filter it assumes the field exists which by default the field exists on all.
//It will only apply searches on the conditions which you send in.
//
app.post("/api/getSpacesByCustomCriteria/", (req, res) => {
         
        // req.body.listingId
        // req.body.eventTypes
        // req.body.location
        // req.body.budgetMin
        // req.body.budgetMax
        // req.body.capacityMin
        // req.body.capacityMax
        // req.body.features
        // req.body.amenities
        // req.body.extras

        var eventArr     = req.body.eventTypes
        var featureArr   = req.body.features
        var amenitiesArr = req.body.amenities
        var extrasArr    = req.body.extras

        // {"eventTypes":["BirthDay","Reunion"],"location":"Bangalore","budgetMin":25000,"budgetMax":35000,"capacityMin":350, "features": ["Kitchen"], "amenities": ["Wifi"], "extras": ["Full Kitchen"]} mock in POSTMAN
        // the last 
           
       Space.find({
        "listingId":(req.body.listingId) ? req.body.listingId : {$exists :true},
        "tags":(req.body.eventTypes) ? {"$in":eventArr}: {$exists :true},
        "city":(req.body.location) ? req.body.location : {$exists :true},
        "pricing": (req.body.budgetMin&req.body.budgetMax) ? {$gte:req.body.budgetMin,$lte:req.body.budgetMax} : {$exists :true},
        "capacity":(req.body.capacityMin&req.body.capacityMax) ? {$gte:req.body.capacityMin,$lte:req.body.capacityMax} : {$exists :true},
        "features":(req.body.features) ? {"$all":featureArr} : {$exists :true},
        "amenities":(req.body.amenities) ? {"$all":amenitiesArr} : {$exists :true},
        "extras":(req.body.extras) ? {"$all":extrasArr} : {$exists :true}}, function(err,space){
      if(err){
        console.log(err);
      }
      else {

        if(space.length > 0)
             res.send(space);
        else
             res.send("No spaces found for given filter")
        console.log("Results found :")
        console.log(space.length)          
      }
    });
});