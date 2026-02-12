const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: "Snacks",
    trim: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 100, // Lower number = higher priority in listing
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
