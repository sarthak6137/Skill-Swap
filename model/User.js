const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    
  name:{
     type: String,
     required: true 
    },

  email:{
    type: String, 
    required: true, 
    unique: true 
    },

  password:{ 
    type: String, 
    required: true 
    },

   skillsOffered:[String],

   skillsNeeded: [String],

   XP:{ 
     type: Number, 
     default: 0 
     },

   sessionsHistory:[{ 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Session' 
    }],

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,         
      lowercase: true    
    },

    followers: {
     type: Number,
     default: 0,
    },

    averageRating: {
     type: Number,
     default: 0,
    },

    avatar: {
     type: String,
     default: "", // or you can set a default avatar URL
    },

    resetToken: {
     type: String,
    },

    resetTokenExpiry: {
     type: Date,
    },

    bio:{
    type:String,
    default:""
    },

    avatar:{
    type:String,
    default:""
    }

})

module.exports = mongoose.model("user",userSchema)