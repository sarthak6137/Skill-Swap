const express = require("express");
const router = express.Router();

const{auth} = require("../middleware/auth");
const {me} = require("../controllers/Me");
const {signup, login, updatePassword, forgetPassword, resetPassword} = require("../controllers/Auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);
router.post("/updatePassword",auth,updatePassword);
router.post("/forget-password",forgetPassword);
router.post("/reset-password/:token",resetPassword);

module.exports = router;