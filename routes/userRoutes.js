const express = require("express");
const router = express.Router();
const User = require("../model/User")

const {getProfile, updateProfile} = require("../controllers/Auth");
const{auth} = require("../middleware/auth");


router.get("/profile/:id", getProfile);
router.put("/update", auth, updateProfile);


module.exports = router;