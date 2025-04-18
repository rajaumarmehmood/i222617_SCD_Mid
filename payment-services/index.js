require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3003;

// Payment schema
const paymentSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

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

// Process payment
app.post("/", async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order details
    const orderResponse = await axios.get(
      `${process.env.ORDER_SERVICE_URL}/${orderId}`
    );
    const order = orderResponse.data;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create payment record
    const payment = new Payment({
      orderId,
      amount: order.total,
      status: "completed",
    });
    await payment.save();

    res.status(201).json(payment);
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// Get payment by ID
app.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

app.listen(port, () => {
  console.log(`Payment service running on port ${port}`);
});
