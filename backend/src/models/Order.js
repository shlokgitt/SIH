const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },

    // THE SNAPSHOT — this is your core design decision. Copied at order time,
    // never updated again even if the original Batch's labValues change later.
    // The Advisory calculator will read from HERE, not from Batch.
    batchSnapshot: {
      batchCode: String,
      labValues: {
        nitrogen: Number,
        phosphorus: Number,
        potassium: Number,
        organicCarbon: Number,
        ph: Number,
        moisture: Number,
        cToNRatio: Number,
      },
      complianceStatus: String,
    },

    quantityKg: { type: Number, required: true },
    pricePerKgAtOrder: { type: Number, required: true }, // also snapshotted — price can change later too
    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["placed", "confirmed", "cancelled", "delivered"],
      default: "placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);