const express = require("express");
const router = express.Router();

const{auth} = require("../middleware/auth");
const {matchSkill, skillPost, getAllSkills, getSkillsByUser, deleteSkill} = require("../controllers/Skills");

router.get("/match/:skill", matchSkill);
router.post("/post", auth, skillPost);
router.get("/getSkills",getAllSkills);
router.get("/user/:id",getSkillsByUser);
router.delete("/delete/:id",deleteSkill);

module.exports = router;