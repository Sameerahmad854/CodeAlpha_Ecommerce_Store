const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const customerName = String(body.customerName || "").trim();
  const address = String(body.address || "").trim();
  const cartItems = body.items;

  if (customerName.length < 2 || customerName.length > 80) {
    return res.status(400).json({ message: "Please enter your full name." });
  }
  if (address.length < 8 || address.length > 300) {
    return res.status(400).json({ message: "Please enter a complete delivery address." });
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 30) {
    return res.status(400).json({ message: "Your cart is empty or contains too many items." });
  }

  const quantities = new Map();
  for (const item of cartItems) {
    if (!item || !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      return res.status(400).json({ message: "One or more cart items are invalid." });
    }
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 20)) {
    return res.status(400).json({ message: "Each product is limited to 20 units per order." });
  }

  // Atomically reserve stock per product. This works with a normal local MongoDB server
  // and avoids relying on replica-set transactions for this learning project.
  const reserved = [];
  try {
    const orderLines = [];
    let total = 0;

    for (const [productId, quantity] of quantities) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        const exists = await Product.exists({ _id: productId });
        throw new Error(exists ? "A product does not have enough stock." : "A product in your cart no longer exists.");
      }

      reserved.push({ productId: product._id, quantity });
      orderLines.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
      total += product.price * quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderLines,
      total,
      customerName,
      address
    });

    res.status(201).json({
      message: "Order placed successfully. Payment is not enabled in this demo.",
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    // Restore any stock already reserved if a later item or order save fails.
    for (const item of reserved) {
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }).catch(() => {});
    }
    res.status(400).json({ message: error.message || "Could not place your order." });
  }
});

router.get("/my-orders", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Could not load your orders." });
  }
});

module.exports = router;
