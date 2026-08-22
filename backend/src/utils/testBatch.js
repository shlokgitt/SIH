require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Batch = require("../models/Batch");
const mongoose = require("mongoose");

async function run() {
  await connectDB();

  // Clean up any leftover test data from a previous run
  await Batch.deleteOne({ batchCode: "TEST-BATCH-001" });

  // We need an existing plant user to attach this batch to.
  // Reuse the one we created earlier via register/testUser.
  const plant = await User.findOne({ email: "testplant@example.com" });
  if (!plant) {
    throw new Error("No test plant user found — run testUser.js or register via Thunder Client first");
  }

  const batch = await Batch.create({
    plant: plant._id,
    batchCode: "TEST-BATCH-001",
    labValues: {
      nitrogen: 1.2,
      phosphorus: 0.8,
      potassium: 1.0,
      organicCarbon: 9.5,
      ph: 7.2,
      moisture: 18,
      cToNRatio: 15,
    },
    quantityKgTotal: 5000,
    quantityKgAvailable: 5000,
    pricePerKg: 4.5,
    pickupLocation: { lat: 28.5, lng: 77.3, address: "Test Plant Yard" },
  });

  console.log("Created batch:", batch);

  const found = await Batch.findById(batch._id).populate("plant", "name email role");
  console.log("Populated plant reference:", found.plant);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Test failed:", err.message);
  process.exit(1);
});