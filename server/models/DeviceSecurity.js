const mongoose = require("mongoose");

const deviceSecuritySchema = new mongoose.Schema(
  {
    fingerprint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invalidAttempts: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeviceSecurity", deviceSecuritySchema);
