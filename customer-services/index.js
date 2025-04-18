require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3005;

// Customer schema
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  points: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

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

// Create new customer
app.post("/", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Get customer by ID
app.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Update customer points
app.post("/update-points", async (req, res) => {
  try {
    const { customerId, points } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    customer.points += points;
    await customer.save();

    res.json(customer);
  } catch (err) {
    console.error("Error updating customer points:", err);
    res.status(500).json({ error: "Failed to update customer points" });
  }
});

app.listen(port, () => {
  console.log(`Customer service running on port ${port}`);
});
