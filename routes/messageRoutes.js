const express = require("express");
const router = express.Router();

const {sendMessage, getChatBySession} = require("../controllers/Messages");
const {auth} = require("../middleware/auth");

router.post("/sendMessage",auth,sendMessage);
router.get("/messageHistory/:id",getChatBySession);

module.exports = router;