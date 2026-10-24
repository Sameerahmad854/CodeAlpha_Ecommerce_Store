const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  total: { type: Number, required: true, min: 0 },
  customerName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);