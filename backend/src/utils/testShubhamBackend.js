require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Order = require("../models/Order");

async function runTest() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected Successfully!");

    console.log("Checking User, Batch, Order collections...");
    const userCount = await User.countDocuments();
    const batchCount = await Batch.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log(`📊 DB Stats -> Users: ${userCount}, Batches: ${batchCount}, Orders: ${orderCount}`);
    console.log("✅ Backend initialization and DB connection test passed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTest();
