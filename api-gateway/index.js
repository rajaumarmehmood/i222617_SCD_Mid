require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3000;

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Proxy routes with basic error handling
app.use(
  "/menu",
  createProxyMiddleware({
    target: "http://menu-service:3001",
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Menu service error:", err);
      res.status(500).json({ error: "Menu service unavailable" });
    },
  })
);

app.use(
  "/orders",
  createProxyMiddleware({
    target: "http://order-service:3002",
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Order service error:", err);
      res.status(500).json({ error: "Order service unavailable" });
    },
  })
);

app.use(
  "/payments",
  createProxyMiddleware({
    target: "http://payment-service:3003",
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Payment service error:", err);
      res.status(500).json({ error: "Payment service unavailable" });
    },
  })
);

app.use(
  "/inventory",
  createProxyMiddleware({
    target: "http://inventory-service:3004",
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Inventory service error:", err);
      res.status(500).json({ error: "Inventory service unavailable" });
    },
  })
);

app.use(
  "/customers",
  createProxyMiddleware({
    target: "http://customer-service:3005",
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Customer service error:", err);
      res.status(500).json({ error: "Customer service unavailable" });
    },
  })
);

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
