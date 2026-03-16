const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "session",
    default: null
  },
}, { timestamps: true });

module.exports = mongoose.model("message", messageSchema);
