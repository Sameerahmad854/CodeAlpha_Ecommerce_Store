require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const Product = require("./models/Product");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ message: "Shop API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

const starterProducts = [
  { name: "Classic Sneakers", description: "Everyday sneakers with a clean, comfortable design.", price: 3499, category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", stock: 20 },
  { name: "Wireless Headphones", description: "Comfortable headphones for music, study and calls.", price: 5299, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", stock: 15 },
  { name: "Minimal Watch", description: "A simple watch style that works for everyday outfits.", price: 4199, category: "Accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", stock: 12 },
  { name: "Everyday Backpack", description: "A practical backpack for classes, work and travel.", price: 2899, category: "Accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", stock: 18 },
  { name: "Smartphone", description: "A modern smartphone for everyday communication.", price: 45999, category: "Electronics", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", stock: 8 },
  { name: "Sunglasses", description: "A lightweight pair of sunglasses for sunny days.", price: 1599, category: "Fashion", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80", stock: 25 }
];

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(starterProducts);
    console.log("Starter products added.");
  }
}

async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and update it.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Shop is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the server:", error.message);
    process.exit(1);
  }
}

startServer();