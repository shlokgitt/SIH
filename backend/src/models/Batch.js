const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    batchCode: { type: String, required: true, unique: true },

    labValues: {
      nitrogen: { type: Number, required: true },
      phosphorus: { type: Number, required: true },
      potassium: { type: Number, required: true },
      organicCarbon: { type: Number, required: true },
      ph: { type: Number, required: true },
      moisture: { type: Number },
      cToNRatio: { type: Number },
    },

    complianceStatus: {
      type: String,
      enum: ["pending", "compliant", "non_compliant"],
      default: "pending",
    },
    complianceViolations: [
      {
        parameter: String,
        value: Number,
        expected: String,
      },
    ],

    qrCodeDataUrl: { type: String },
    certificateUrl: { type: String },

    quantityKgTotal: { type: Number, required: true },
    quantityKgAvailable: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },

    pickupLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, trim: true },
    },

    listedInMarketplace: { type: Boolean, default: false },

    producedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

batchSchema.index({ complianceStatus: 1, listedInMarketplace: 1 });

module.exports = mongoose.model("Batch", batchSchema);