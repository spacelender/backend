const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    email:String,
    userName:String,
    password:String,
    userId:String,
    bookings:[{
        listingId:String,
        status:Number,
        date:Date
        }],
    contactNum:String    
   });

   const SpaceSchema = new Schema ({
    name:String,
    listingId:String,
    city:String,
    description:String,
    pricing:Number,
    capacity:Number,
    detailedAddress:String,
    listedBy:String,
    features:[String],
    amenities:[String],
    extras:[String],
    optionals:[{
        name:String,
        desc:String,
        rental:Number,
        }],
    images:[],
    tags:[String],
    currentBookings:[{
    }],
    availability:[{
    }]
   });

const user =mongoose.model('user', UserSchema, 'users');
const space =mongoose.model('space', SpaceSchema, 'spaces');

const myModels={'user':user,'space':space}
module.exports = myModels;