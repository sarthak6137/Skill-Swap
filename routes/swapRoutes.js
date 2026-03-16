const express = require("express");
const router = express.Router();

const {sendSwapRequest, fetchSwapRequest, respondToFetchRequest} = require("../controllers/Swap");
const {auth} = require("../middleware/auth");

router.post("/request",auth,sendSwapRequest);
router.get("/fetchRequest",fetchSwapRequest);
router.post("/respond/:id",auth,respondToFetchRequest);

module.exports = router;