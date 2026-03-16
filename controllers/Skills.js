const User = require("../model/User");
const Skill = require("../model/Skill");
require("dotenv").config();

//=================Skills Match Handler======================
exports.matchSkill = async (req,res) => {
    try{
       const skill = req.params.skill;
       const matchedUser = await User.find({skillsOffered:skill}).select("-password");

       res.status(200).json({
       success:true,
       users:matchedUser,
       });
    }
    catch(error){
        res.status(500).json({
        success:false,
        message:"No match found",
        error:message.error,
       });
    }
}

//====================Skills Post Handler============================
exports.skillPost = async (req,res) => {
    try{
      const {description,skillName} = req.body;
      const userId = req.user.id;
      console.log("User ID from token:", userId);
      console.log("Skill data:", { skillName, description });

      if(!skillName){
        return res.status(400).json({
            success:false,
            message:"Skill Name is required",
        });
      }

      const newSkill = await Skill.create({
        user:userId,
        skillName,
        description,
      });

      res.status(201).json({
        success:true,
        message:"Skill Post Created Successfully",
        skill: newSkill,
      });
    }
    catch(error){
           console.error("Error creating skill:", error);
           res.status(500).json({
           success: false,
           message: "Internal Server Error",
        });
    }
}

//=====================Skills Fetch Handler==========================

exports.getAllSkills = async (req,res) => {
  try{
        const skills = await Skill.find().populate("user","name email");
        res.status(200).json({
             success: true,
             message: "Skills fetched successfully",
             skills,
            });
  }
  catch(error){
      res.status(500).json({
        success:true,
        message:"Failed to fetch skills",
        error:error.message,
      })
  }
}

//======================Fetching The Skills By User Id================================

exports.getSkillsByUser = async (req,res) => {
  try{
      const userId = req.params.id;
      const skills = await Skill.find({user:userId}).populate("user","name email");
      res.status(200).json({
           success: true,
           message: `Skills for user ${userId} fetched successfully`,
           skills,
          });
  }
  catch(error){
      res.status(500).json({
      success: false,
      message: 'Failed to fetch skills for user',
      error: error.message,
    });
  }
}

//======================Deleting The Skills By User Id================================

exports.deleteSkill = async (req,res) => {
  try{
      const skillId = req.params.id;
      console.log("Attempting to delete skill:", skillId);

      const deletedSkill = await Skill.findByIdAndDelete(skillId);

      if(!deletedSkill){
        return res.status(404).json({
          success:false,
          message:"Skill not found"
        });
      }

       res.status(200).json({
          success: true,
          message: "Skill deleted successfully",
          deletedSkill,
       });
  }
  catch(error){
          res.status(500).json({
            success: false,
            message: "Failed to delete skill",
            error: error.message,
          });
  }
} 