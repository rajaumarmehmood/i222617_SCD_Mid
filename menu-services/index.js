require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3001;

// Simple menu item schema
const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongodb:27017/cafe", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Basic error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Get all menu items
app.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Add a menu item
app.post("/", express.json(), async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error("Error adding menu item:", err);
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

app.listen(port, () => {
  console.log(`Menu service running on port ${port}`);
});
