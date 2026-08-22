const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use("/api/marketplace", require("./routes/marketplaceRoutes"));
app.use("/api/advisory", require("./routes/advisoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/batches", require("./routes/batchRoutes"));

module.exports = app;