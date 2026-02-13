const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);
