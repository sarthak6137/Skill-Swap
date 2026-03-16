const express = require("express");
const router = express.Router();

const{book, fetchSession, completeSession, respondSession} = require("../controllers/Sessions");
const{auth} = require("../middleware/auth");

router.post("/book",auth,book);
router.patch("/respondSession/:id",auth,respondSession);
router.get("/fetchSession/:id",fetchSession);
router.patch("/complete/:id",auth,completeSession);
// router.post("/feedback/:id",auth,submitFeedback);

module.exports = router;