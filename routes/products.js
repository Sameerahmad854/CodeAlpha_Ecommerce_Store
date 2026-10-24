const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim().slice(0, 100);
    const category = String(req.query.category || "").trim().slice(0, 80);
    const sortOptions = {
      featured: { createdAt: 1 },
      "price-asc": { price: 1, name: 1 },
      "price-desc": { price: -1, name: 1 },
      name: { name: 1 }
    };
    const sort = sortOptions[req.query.sort] || sortOptions.featured;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } }
      ];
    }
    const products = await Product.find(filter).sort(sort).limit(200);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Could not load products." });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories: categories.sort((a, b) => a.localeCompare(b)) });
  } catch (error) {
    res.status(500).json({ message: "Could not load product categories." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Could not load this product." });
  }
});

module.exports = router;
