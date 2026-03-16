const express = require("express");
const User = require("../model/User");
require("dotenv").config();

exports.me = async (req,res,next) => {
    
    try{
         const userId = req.user.id;
         const user = await User.findById(userId).select("-password");

         if(!user){
            res.status(404).json({
                success:false,
                message:"user not found",
            })
         }

         res.status(200).json({
            success:true,
            user,
         });
    }
    catch(error){
       response.status(500).json({
            success:false,
            message:"Something went wrong , while verifying the token"
        });
    }
}