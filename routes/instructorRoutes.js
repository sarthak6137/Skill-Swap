const express = require("express");
const router = express.Router();
const { getTopInstructor, reviewInstructor, getUserReviews, search } = require("../controllers/Instructor");
const { auth } = require("../middleware/auth");

router.get("/top", getTopInstructor);
router.post("/review",auth,reviewInstructor);
router.get("/fetchReview/:id",getUserReviews);
router.get("/search",search);

module.exports = router;
