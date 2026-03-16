const Message = require("../model/Message");
const Session = require("../model/Session");

//========================Message Handler==========================
exports.sendMessage = async (req,res) => {
    try{
       const senderId = req.user.id;
       const {to, message, sessionId} = req.body;
       
       if(!to || !message){
        return res.status(400).json({
            success:false,
            message:"Recipient and message are required",
        });
       }

       // Validating whether the request is accepted or not to chat
       const hasAcc = await Session.findOne({
        status: "accepted", 
        $or : [
            {student : senderId, mentor : to},
            {student : to, mentor : senderId}
        ]
       });

       if(!hasAcc){
        return res.status(403).json({
            success:false,
            message:"You are not allowed to talk to the user unless the session is accepted",
        });
       }

       const newMessage = await Message.create({
        from : senderId,
        to,
        message,
        sessionId : sessionId || null,
       });

       res.status(200).json({
        success:true,
        message:"Message sent successfully",
        newMessage,
       });
    }
    catch(error){
      console.error("Sending message error",error);
      res.status(500).json({
        status:false,
        message:"Server error while sending message",
      });
    }
}

//========================Message History Handler===========================

exports.getChatBySession = async (req,res) => {
  try{
     const sessionId = req.params.id;
     
     const messages = await Message.find({sessionId})
     .sort({createdAt : 1})
     .populate("from","username")
     .populate("to","username");

     res.status(200).json({
      success:true,
      messages,
     })
  }
  catch(error){
      res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
}