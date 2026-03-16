const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/sendEmail");
require("dotenv").config();

// ===================== Signup Handler =====================
exports.signup = async (req,res) => {
    try{
        //Get data...
        const{name, email, password, username} = req.body;

        //Validitation

        // This is for that all these tree have to write...
             if (!name || !email || !password || !username) {
             return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
           }
     
        // This is for writting a valid email...    
           const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!isValidEmail) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // This condition for password must be of 6 characters...
            if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Check if user alredy exist...
        const existingUser = await User.findOne({$or: [{ email }, { username }]});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User Already Exists",
            });
        }

        //Secure Password...
        let hashedPassword;
        try{
            hashedPassword = await bcrypt.hash(password,10);
        }
        catch(error){
            res.status(500).json({
                success:false,
                message:"Error in hashing password"
            });
        }
        
        const user = await User.create({
            name,username,email,password : hashedPassword
        })

        const payload = { id: user._id, email: user.email, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

        const userData = user.toObject();
        userData.password = undefined;
        userData.token = token;

        res.cookie("token", token, {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true
        }).status(200).json({
        success: true,
        message: "User Created Successfully",
        user: userData,
        token
        });


    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again",
        });
    }
}

// ===================== Login Handler =====================
exports.login = async (req,res) => {
    try{
      const {identifire, password} = req.body;
    
      // This is for filling both identifire and password...
        if(!identifire || !password){
        return res.status(400).json({
            success:false,
            message:"Enter the details correctly",
        });
      }

      const user = await User.findOne({$or: [{username: identifire.toLowerCase()}, {email: identifire.toLowerCase()}]});

      if(!user){
        return res.status(400).json({
            success:false,
            message:"User not found, signup first"
        })
      }

      const isValidPassword = await bcrypt.compare(password,user.password);

      const payload = {
        email:user.email,
        id:user._id,
        username:user.username,
      }

      if(isValidPassword){
        let token = jwt.sign(payload,
                             process.env.JWT_SECRET,
                             {
                                expiresIn:"2h",
                             })

      const userData = user.toObject();
      userData.password = undefined;
      userData.token = token;
      const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly:true, // Its meaning is you cant able to access in client side...
        }
        res.cookie("token",token).status(200).json({
            success:true,
            user: userData,
            token,
            message:"User logged in successfully",
        })                     
      }      
      else{
            res.status(404).json({
                success:false,
                message:"Password invalid",
            })
      }
    }
    catch(error){
         console.error(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure",
        });
    }
}

// ===================== Get profile handler =====================

exports.getProfile = async (req,res) => {
    try{
          const userId = req.params.id;
          const user = await User.findById(userId).select("password");
          if(!user){
            return res.status(404).json({
                sucess:false,
                message:"User not found",
            });
          }

          res.status(200).json({
            success:true,
            profile:user,
          });
    }
    catch(error){
          req.status(500).json({
            success:false,
            message:"Server Error",
          });
    }
} 

// ===================== Update profile handler =====================

exports.updateProfile = async (req,res) => {
    try{
        const userId = req.user.id;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId,updates,{new:true, runValidators:true}).select("-password");

        res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            user:updatedUser,
        });
    }
    catch(error){
     console.error("Update Profile Error:", error);
     res.status(500).json({
        success:false,
        message:"Server Error",
        error: error.message,
     });
    }
}

//=========================Update Password Route==========================

exports.updatePassword = async (req,res) => {
    try{
       const {oldPassword, newPassword} = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found",
        });
    }

    const isMatch = await bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
        return res.status(404).json({
            success:false,
            message:"Incorrect Password",
        });
    }

    user.password = await bcrypt.hash(newPassword,10);
    await user.save();

    res.status(200).json({
        success:true,
        message:"Password updated successfully",
    });
    }
    catch(error){
       console.error("Updating password error",error);
       res.status(500).json({
        success:false,
        message:"Internal server error"
       });
    }
}

//===================Forget Password Handler=====================
exports.forgetPassword = async (req,res) => {
    try{
     const {email} = req.body;

     if(!email){
        return res.status(404).json({
            success:false,
            message:"Email is required",
        });
     }

     const user = await User.findOne({email});

     if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found",
        });
     }

     //Generate token and hash...
     const resetToken = crypto.randomBytes(32).toString("hex");
     const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

     //Save token and expiry to the user...
     user.resetToken = hashedToken;
     user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
     await user.save();

     //create reset URL
     const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

     const message = `You requested to reset your password. \n\nClick the link below to reset it:\n\n${resetURL}\n\nThis link will expirein 15 minutes.`;

     await sendEmail({
        to: email,
        subject: "SkillSwap - Reset Your Password",
        text: message,
     });

      res.status(200).json({
      success: true,
      message: "Reset password email sent successfully",
    });
    }
    catch(error){
       console.error("Forgot Password Error:", error);
       res.status(500).json({ 
       success: false,
       message: "Something went wrong" 
       });
    }
}

//==============Reset Password Handler===========

exports.resetPassword = async (req,res) => {
    try{
      const {token} = req.params;
      const {newPassword} = req.body;

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        resetToken:hashedToken,
        resetTokenExpiry: {$gt: Date.now()},
      });

      if(!user){
        return res.status(400).json({
            success:false,
            message:"Token is invalid or expired"
        });
      }

      user.password = await bcrypt.hash(newPassword,10);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;

      await user.save();

      res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
    }
    catch(error){
       console.error("Reseting password error",error);
       res.status(500).json({
        success:false,
        message:"Something went wrong",
       });
    }
}