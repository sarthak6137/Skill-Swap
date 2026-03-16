const SwapRequest = require("../model/SwapRequest");
const User = require("../model/User");
const Skill = require("../model/Skill");


//=====================Send Swap Request================================
exports.sendSwapRequest = async (req,res) => {
    try{
       const {toUsername,fromSkillName,toSkillName} = req.body;
       const fromUserId = req.user.id;
        console.log("From User ID:", fromUserId);

       if (!toUsername || !fromSkillName || !toSkillName) {
          return res.status(400).json({
          success: false,
          message: "Missing required fields",
         });
        }

        //Finding the toUser by username...
        const toUser = await User.findOne({username : toUsername});
        if(!toUser){
            return res.status(404).json({
                success:false,
                message:"Recipient user not found",
            });
        }

        //Finding the fromSkill of the user
        const fromSkill = await Skill.findOne({user : fromUserId, skillName : fromSkillName});
        if(!fromSkill){
            return res.status(404).json({
                success:false,
                message:"Your skill not found",
            });
        }
        console.log("From Skill Name:", fromSkillName);

        //Finding the toSkill...
        const toSkill = await Skill.findOne({user : toUser.id, skillName : toSkillName});
         if(!toSkill){
            return res.status(404).json({
                success:false,
                message:"Target user's skill not found",
            });
        }

        const newRequest = await SwapRequest.create({
            fromUser: fromUserId,
            toUser: toUser._id,
            fromSkill: fromSkill.skillName,
            toSkill: toSkill.skillName,
        });

         res.status(200).json({
            success: true,
            message: "Swap request sent successfully",
            request: newRequest,
        });
    }
    catch(error){
         console.error("Error sending swap request:", error);
         res.status(500).json({
         success: false,
         message: "Server Error",
        });
    }
}

//=====================Fetch Swap Request================================
exports.fetchSwapRequest = async(req,res) => {
    try{
        const requests = await SwapRequest.find()
          .populate("fromUser","username")
          .populate("toUser","username")

          res.status(200).json({
             success: true,
             data: requests,
             });
    }
    catch(error){
          console.error("Error fetching swap requests:", error);
            res.status(500).json({
            success: false,
            message: "Server error while fetching swap requests",
         });
    }
}

//=====================Respond to Request================================

exports.respondToFetchRequest = async (req,res) => {
    try{
        const requestId = req.params.id;;
        const {status} = req.body;
        const userId = req.user.id;

        //Validate The Status...

        if(!["accepted","rejected"].includes(status)){
            return res.status(400).json({
                success:false,
                message:"Invalid status, must be 'accepted' or 'rejected'",
            });
        }

        //Find the request...

        const request = await SwapRequest.findById(requestId);

        if(!request){
            return res.status(404).json({
                success:false,
                message:"Swap request not found",
            });
        }
       
        //Checking that only recipiant should response...
        if (request.toUser.toString() !== userId) {
            return res.status(403).json({
            success: false,
            message: "You are not authorized to respond to this request",
            });
        }
        
         request.status = status;
         await request.save();

         res.status(200).json({
            success: true,
            message: `Swap request ${status} successfully`,
            request,
           });

    }
    catch(error){
          console.error("Error responding to swap request:", error);
          res.status(500).json({
          success: false,
          message: "Server error",
          });
    }
}