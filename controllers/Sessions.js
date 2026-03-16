const Session = require("../model/Session");
const Skill = require("../model/Skill");
const User = require("../model/User");

exports.book = async (req,res) => {
    try{
         const {mentorUsername, skillName, scheduleTime} = req.body;
         const studentId = req.user.id;

         if(!mentorUsername || !skillName || !scheduleTime){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
         }

         const mentor = await User.findOne({username : mentorUsername});
         if(!mentor){
            return res.status(404).json({
                success:false,
                message:"Mentor not found",
            })
         }

         const skill = await Skill.findOne({user : mentor._id, skillName});
         if (!skill) {
           return res.status(404).json({
            success: false,
           message: "Skill not found for this mentor",
          });
          }

         const newSession = await Session.create({
            student: studentId,
            mentor: mentor._id,
            skill: skill._id,
            scheduledTime: scheduleTime,
           });

         res.status(200).json({
             success: true,
             message: "Session booked successfully",
             session: newSession,
           }); 
    }
    catch(error){
      console.error("Error booking session",error);
      res.status(500).json({
        success:false,
        message:"Internal server error",
      })
    }
}

//====================Fetching the sessions by userId==========================

exports.fetchSession = async (req,res) => {
    try{
         const userId = req.params.id;
         const sessions = await Session.find({$or: [{student: userId}, {mentor : userId}]})
         .populate("student","username")
         .populate("mentor","username")
         .populate("skill","skillName");

         res.status(200).json({
            success:true,
            sessions,
         });
    }
    catch(error){
          console.error("Error fetching sessions:", error);
            res.status(500).json({
            success: false,
            message: "Internal Server Error",
            });
    }
}

//=================Completing the Session Handler=================

exports.completeSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Only mentor should be allowed to mark session as completed
    if (session.mentor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the mentor can complete this session",
      });
    }

    // Already completed?
    if (session.completed) {
      return res.status(400).json({
        success: false,
        message: "Session is already marked as completed",
      });
    }

    // Mark as completed
    session.completed = true;
    await session.save();

    res.status(200).json({
      success: true,
      message: "Session marked as completed",
      session
    });

  } catch (error) {
    console.error("Error completing session:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//=================Feedback to the session==================

// exports.submitFeedback = async (req,res) => {
//   try{
//      const sessionId = req.params.id;
//      const studentId = req.user.id;
//      const {rating, comment, recommend} = req.body;

//      //Validate...
//      if(rating > 5 || rating < 1 ){
//       return res.status(400).json({
//         success:false,
//         message:"Rating must be between 1 and 5",
//       });
//      }

//      //Find Session...
//      const session = await Session.findById(sessionId);
//      if(!session){
//       return res.status(404).json({
//         success:false,
//         message:"Session not found",
//       });
//      }

//      //Only student can submit the feedback...
//      if(session.student.toString() !== studentId){
//       return res.status(403).json({
//         success:false,
//         message:"Only student can send the feedback",
//       });
//      }

//      //Check if session is completed or not...
//      if(!session.completed){
//       return res.status(400).json({
//         success:false,
//         message:"Session is not completed",
//       });
//      }

//      //Check if feedbackalready subbmitted or not...
//      if(session.feedback && session.feedback.rating){
//       return res.status(400).json({
//         success:false,
//         message:"Feedback already submited",
//       });
//      }

//      session.feedback = {rating, comment, recommend};
//      await session.save();

//      res.status(200).json({
//       success:true,
//       feedback:session.feedback,
//      })
//   }
//   catch(error){
//       console.error("Submit feedback error",error);
//       res.status(500).json({
//         success:true,
//         message:"Server Error",
//       });
//   }
// }

//=====================Session Accepted Handler========================

exports.respondSession = async (req,res) => {
  try{
    const sessionId = req.params.id;
    const mentorId = req.user.id;
    const {status} = req.body;

     // Validate status
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'accepted' or 'rejected'.",
      });
    }

    const session = await Session.findById(sessionId);
    if(!session){
      return res.status(404).json({
        success:false,
        message:"Session not found"
      });
    }

    if(session.mentor.toString() !== mentorId){
      return res.status(403).json({
        succss:false,
        message:"Only mentor can accept or reject the request"
      });
    }
   
    //Check if the session is already accepted or rejected...
    if (session.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Session is already ${session.status}`,
      });
    }

    session.status = status;
    await session.save();

    res.status(200).json({
      success:true,
      message:`session status ${status} successfully`,
      session,
    });
  }
  catch(error){
    console.error("Error responding to the session",error);
    res.status(500).json({
      success:false,
      message:"Server error while responding to the session",
    });
  }
}