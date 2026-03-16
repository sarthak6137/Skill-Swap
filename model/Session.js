const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "skill",
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  feedback: {
    rating: { type: Number, min : 1, max : 5 },
    comment: { type: String },
    recommend: { type: Boolean },
   },
   completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("session", sessionSchema);
