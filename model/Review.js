const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: "",
  },
  // Optional: keep for future session tracking
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("review", reviewSchema);
