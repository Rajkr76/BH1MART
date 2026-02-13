const mongoose = require("mongoose");

const orderLogSchema = new mongoose.Schema({
  fingerprint: {
    type: String,
    index: true,
  },
  phone: {
    type: String,
  },
  ip: {
    type: String,
  },
  status: {
    type: String,
    enum: ["valid", "invalid", "blocked"],
    required: true,
  },
  reason: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("OrderLog", orderLogSchema);
