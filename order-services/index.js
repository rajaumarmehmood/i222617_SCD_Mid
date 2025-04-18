require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3002;

// Order schema
const orderSchema = new mongoose.Schema({
  customerId: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

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

// Create new order
app.post("/", async (req, res) => {
  try {
    const { customerId, items } = req.body;

    // Calculate total and validate items
    let total = 0;
    for (const item of items) {
      const menuResponse = await axios.get(
        `${process.env.MENU_SERVICE_URL}/${item.name}`
      );
      if (!menuResponse.data || menuResponse.data.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: "Item not available in sufficient quantity" });
      }
      total += menuResponse.data.price * item.quantity;
    }

    // Create order
    const order = new Order({
      customerId,
      items,
      total,
    });
    await order.save();

    // Update inventory
    for (const item of items) {
      await axios.post(`${process.env.INVENTORY_SERVICE_URL}/update`, {
        name: item.name,
        quantity: -item.quantity,
      });
    }

    // Update customer points
    await axios.post(`${process.env.CUSTOMER_SERVICE_URL}/update-points`, {
      customerId,
      points: Math.floor(total),
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get order by ID
app.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.listen(port, () => {
  console.log(`Order service running on port ${port}`);
});
