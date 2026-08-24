require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Order = require("../models/Order");

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await connectDB();

    console.log("Cleaning existing sample test data (keeping schema intact)...");
    await User.deleteMany({ email: { $regex: "@example.com$" } });
    await Batch.deleteMany({});
    await Order.deleteMany({});

    console.log("1. Creating Sample Plant Users & Buyers...");
    const plant1 = await User.create({
      name: "GreenBio Energy Plant - Ghaziabad",
      email: "plant1@example.com",
      password: "password123",
      role: "plant",
      phone: "+91-9876543210",
      location: {
        lat: 28.6692,
        lng: 77.4538,
        address: "Industrial Area Site 4, Sahibabad, Ghaziabad, UP",
      },
      plantDetails: {
        plantName: "GreenBio Organics Pvt Ltd",
        licenseNumber: "UP-FCO-2025-0891",
      },
    });

    const plant2 = await User.create({
      name: "Sunrise Bio-CNG & Organic Fertilizers",
      email: "plant2@example.com",
      password: "password123",
      role: "plant",
      phone: "+91-9811223344",
      location: {
        lat: 28.4595,
        lng: 77.0266,
        address: "Sector 34, Gurugram, Haryana",
      },
      plantDetails: {
        plantName: "Sunrise Bio-CNG Plant",
        licenseNumber: "HR-FCO-2024-4412",
      },
    });

    const buyer1 = await User.create({
      name: "Ramesh Kumar (Farmer)",
      email: "farmer1@example.com",
      password: "password123",
      role: "buyer",
      phone: "+91-9988776655",
      location: {
        lat: 28.5355,
        lng: 77.391,
        address: "Noida Sector 62, UP",
      },
      farmerDetails: {
        landAreaAcres: 4.5,
        primaryCrop: "Wheat & Sugarcane",
      },
    });

    console.log("2. Creating FCO Certified Organic Manure Batches...");
    const batch1 = await Batch.create({
      plant: plant1._id,
      batchCode: "BATCH-FOM-2026-001",
      labValues: {
        nitrogen: 1.4,
        phosphorus: 0.9,
        potassium: 1.1,
        organicCarbon: 16.5,
        ph: 7.4,
        moisture: 18.0,
        cToNRatio: 12.5,
      },
      complianceStatus: "compliant",
      complianceViolations: [],
      qrCodeDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-FOM-2026-001",
      certificateUrl: "http://localhost:5000/api/batches/BATCH-FOM-2026-001/certificate",
      quantityKgTotal: 5000,
      quantityKgAvailable: 4200,
      pricePerKg: 6.5,
      pickupLocation: {
        lat: 28.6692,
        lng: 77.4538,
        address: "Industrial Area Site 4, Sahibabad, Ghaziabad, UP",
      },
      listedInMarketplace: true,
    });

    const batch2 = await Batch.create({
      plant: plant2._id,
      batchCode: "BATCH-FOM-2026-002",
      labValues: {
        nitrogen: 1.8,
        phosphorus: 1.2,
        potassium: 1.4,
        organicCarbon: 18.2,
        ph: 7.1,
        moisture: 15.5,
        cToNRatio: 10.8,
      },
      complianceStatus: "compliant",
      complianceViolations: [],
      qrCodeDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-FOM-2026-002",
      certificateUrl: "http://localhost:5000/api/batches/BATCH-FOM-2026-002/certificate",
      quantityKgTotal: 10000,
      quantityKgAvailable: 9200,
      pricePerKg: 7.0,
      pickupLocation: {
        lat: 28.4595,
        lng: 77.0266,
        address: "Sector 34, Gurugram, Haryana",
      },
      listedInMarketplace: true,
    });

    console.log("3. Creating Sample Orders with Immutable Snapshots...");
    const order1 = await Order.create({
      buyer: buyer1._id,
      batch: batch1._id,
      batchSnapshot: {
        batchCode: batch1.batchCode,
        labValues: batch1.labValues,
        complianceStatus: batch1.complianceStatus,
      },
      quantityKg: 800,
      pricePerKgAtOrder: batch1.pricePerKg,
      totalPrice: 800 * batch1.pricePerKg,
      status: "confirmed",
    });

    console.log("✅ Seed completed successfully!");
    console.log(`Summary:
- Plants Created: 2 (${plant1.name}, ${plant2.name})
- Buyers Created: 1 (${buyer1.name})
- Certified Batches Created: 2 (${batch1.batchCode}, ${batch2.batchCode})
- Orders Created: 1 (ID: ${order1._id})`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seedDatabase();
