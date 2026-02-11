const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  room: { type: String, required: true },
  foodItem: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Index for sorting by date
foodRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("FoodRequest", foodRequestSchema);
