const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors')
var cookieParser = require('cookie-parser')
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const port = 5000;


mongoose = require('mongoose').set('debug', true);
const uri = "mongodb+srv://spacelender:admin123@spacelendermaster.nodha.mongodb.net/spaceLenderDB?retryWrites=true&w=majority";
const dbOptions ={
  useNewUrlParser: true,useUnifiedTopology: true 
}
mongoose.connect(uri,dbOptions).then(() => {  
console.log(mongoose.connection.readyState);
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

        if(user.password===pass)
        { 
          req.session.alreadyLoggedIn = true;
          req.session.email = email;
          console.log("save to redis as current authenticated user ?")
          console.log("User successfully logged in,tracking turned on in Cookie")
          res.send("password match");
        }
        else{
          res.send("wrong password");
        }
        
      }
    });
});

app.post("/api/getSpacesByCustomCriteria/", (req, res) => {
         
        // req.body.eventType
        // req.body.location
        // req.body.budgetMin
        // req.body.budgetMax
        // req.body.capacityMin
        // req.body.eventTypes
        // req.body.features
        // req.body.amenities
        // req.body.extras
        var eventArr     = req.body.eventTypes
        var featureArr   = req.body.features
        var amenitiesArr = req.body.amenities
        var extrasArr    = req.body.extras

        // {"eventTypes":["BirthDay","Reunion"],"location":"Bangalore","budgetMin":25000,"budgetMax":35000,"capacityMin":350} add the last 3 arrays here to mock in POSTMAN
           
  Space.find({"tags":{"$in":eventArr},"city":req.body.location,"pricing":{$gte:req.body.budgetMin,$lte:req.body.budgetMax},"capacity":{$gte:req.body.capacityMin},
  "features":{"$all":featureArr},"amenities":{"$all":amenitiesArr},"extras":{"$all":extrasArr}}, function(err,space){
      if(err){
        console.log(err);
      }
      else {
        console.log(space);
        res.send(space);
      }
    });
});