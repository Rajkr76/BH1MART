const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true },
  type: { type: String, enum: ["message", "system"], default: "message" },
  message: { type: String, required: true },
  sender: { type: String, default: "" },
  role: { type: String, enum: ["customer", "admin", "system"], default: "customer" },
  timestamp: { type: Date, default: Date.now },
});

// Index for fast retrieval of chat history
messageSchema.index({ chatId: 1, timestamp: 1 });

module.exports = mongoose.model("Message", messageSchema);
