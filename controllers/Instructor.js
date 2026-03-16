const User = require("../model/User");
const Review = require("../model/Review");

exports.getTopInstructor = async (req,res) => {
    try{
        const instructors = await User.find({skillsOffered: {$exist: true, $not: {$size:0}}})
        .sort({averageRaring : -1, followers: -1})
        .limit(6)
        .select("name username avatar skillsOffered averageRating followers");

        res.status(200).json({
            success:true,
            instructors,
        })
    }
    catch(error){
       res.status(500).json({
        success:false,
        message:"Failed to fetch the instructors",
        error:error.message,
       });
    }
}

//======================Reviewing the User Handler=========================
exports.reviewInstructor = async (req,res) => {
    try{
        const reviewer = req.user.id;
        const {reviewedUsername, rating, comment} = req.body;

        //Checking if youer is fullfilling all the fields or not...
        if(!reviewedUsername || !rating){
            return res.status(404).json({
                success:false,
                message:"All fields are required",
            });
        }

         // Find the reviewed user by username
        const reviewedUserDoc = await User.findOne({ username: reviewedUsername });
        if (!reviewedUserDoc) {
        return res.status(404).json({
        success: false,
        message: "Reviewed user not found.",
        });
        }

        //Checking if the rating is between 1 and 5 or not
        if(rating > 5 || rating < 1){
            return res.status(404).json({
                success:false,
                message:"Rating should be between 1 and 5",
            });
        }
         
        const reviewedUser = reviewedUserDoc._id;
 
        //Checkin if user trying to rate himself or what...
        if(reviewer.toString() === reviewedUser.toString()){
            return res.status(403).json({
                success:false,
                message:"You can't rate yourself",
            });
        }
         
        //Checking if the user is already reviewed or not...
        const exisistingReview = await Review.findOne({reviewedUser,reviewer});

        if(exisistingReview){
            return res.status(403).json({
                success:false,
                message:"You can't review more than once"
            });
        }

        const review = await Review.create({
            reviewer,
            reviewedUser,
            rating,
            comment,
        });

        //Calculating the average rating of the user...
        const allReviews = await Review.find({reviewedUser});
        const totalRating = allReviews.reduce((sum,r) => sum + r.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await User.findByIdAndUpdate(reviewedUser, {averageRating : averageRating.toFixed(1)},);
        
        res.status(200).json({
            success:true,
            message:"Review successfully submitted"
        })
    }
    catch(error){
      res.status(500).json({
         success: false,
         message: "Failed to submit review",
         error: error.message,
         });
    }
}

//==================Fetching the Reviews by Id======================

exports.getUserReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ reviewedUser: id })
      .populate("reviewer", "username name avatar") // show info about reviewer
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

//=======================Search Handler==========================

exports.search = async (req,res) => {
    try{
       const {query} = req.query;

       if(!query){
        return res.status(404).json({
            success:false,
            message:"Fill the query before searching",
        });
       }

       const regex = new RegExp(query,"i");

       const users = await User.find({
        $or: [
          {name: regex},
          {username: regex},
          {skillsOffered: regex},
          {skillsNeeded: regex},
        ]
       }).select("name username skillsOffered skillsNeeded averageRating avatar");

       res.status(200).json({
        success:true,
        users,
       });
    }
    catch(error){
       res.status(500).json({
         success: false,
         message: "Search failed",
         error: error.message,
         });
        }
}
