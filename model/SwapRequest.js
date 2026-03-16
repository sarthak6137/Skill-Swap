const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  fromSkill: {
    type: String,
    required: true,
  },
  toSkill: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("swapRequest", swapRequestSchema);
