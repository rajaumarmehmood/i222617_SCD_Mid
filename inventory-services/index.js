require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3004;

// Inventory schema
const inventorySchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

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

app.use(express.json());

// Basic error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Get all inventory items
app.get("/", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Update inventory
app.post("/update", async (req, res) => {
  try {
    const { name, quantity } = req.body;

    let item = await Inventory.findOne({ name });
    if (!item) {
      item = new Inventory({ name, quantity: 0 });
    }

    item.quantity += quantity;
    if (item.quantity < 0) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    item.lastUpdated = new Date();
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("Error updating inventory:", err);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

app.listen(port, () => {
  console.log(`Inventory service running on port ${port}`);
});
