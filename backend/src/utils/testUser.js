require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const mongoose = require("mongoose");

async function run() {
  await connectDB();

  // Clean up any leftover test user from a previous run
  await User.deleteOne({ email: "test@plant.com" });

  const user = await User.create({
    name: "Test Plant Operator",
    email: "test@plant.com",
    password: "password123",
    role: "plant",
  });

  console.log("Created user:", user);

  const found = await User.findOne({ email: "test@plant.com" }).select("+password");
  console.log("Password was hashed:", found.password !== "password123");

  const isMatch = await found.comparePassword("password123");
  console.log("comparePassword works:", isMatch);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Test failed:", err.message);
  process.exit(1);
});