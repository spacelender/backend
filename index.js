const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors')
var cookieParser = require('cookie-parser')
var session = require('express-session');
mongoose = require('mongoose').set('debug', true);
const uri = "mongodb+srv://spacelender:admin123@spacelendermaster.nodha.mongodb.net/spaceLenderDB?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true,useUnifiedTopology: true }).then(() => {  
console.log(mongoose.connection.readyState);
	})
  const app = express()
  app.use(cors())
  app.use(bodyParser.json());
  app.use(session({secret:"123e#$#$#$#", resave:false, saveUninitialized:true}));
  app.listen(5000, () => {
    console.log("Server has started!")
  })
const myModels = require('./models.js');
const User = myModels.user
const Space = myModels.space;



app.get("/", (req, res) => {
  res.send("This is from express.js");
});


app.get("/getUserDetailsByMail/:email", (req, res) => {
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

app.get("/getUserDetailsByUUID/:userId", (req, res) => {
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

//need to use post here
app.get("/checkPassword/", (req, res) => {
  // example search --- http://localhost:5000/checkPassword/?email=example001@gmail.com&pass=example124&kitchen=true&publicTrans=true
    let email = req.query.email
    let pass  = req.query.pass
  User.findOne({"email":email}, function(err,user){
      if(err){
        console.log(err);
        
      }
      else {

        if(user.password===pass)
        {
          console.log("Right password")
          console.log("save to redis as current authenticated user ?")
          res.send("password match");
        }
        else{
          res.send("wrong password");
        }
        
      }
    });
});

app.post("/getSpacesByCustomCriteria/", (req, res) => {
         
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