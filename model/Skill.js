const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    
    skillName:{
        type:String,
        required:true,
    },
     
    description:{
        type:String
    },

    createdAt:{
        type:Date,
        default:Date.now,
    },

});

module.exports = mongoose.model("skill",skillSchema);