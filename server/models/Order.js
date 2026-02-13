const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
});

const orderSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  room: { type: String, required: true },
  phase: { type: String, default: "Phase 1" },
  block: { type: String, default: "Boys Block 1" },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  fingerprint: { type: String, index: true, default: "" },
  status: { type: String, enum: ["order placed", "on way", "delivered", "rejected"], default: "order placed" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
