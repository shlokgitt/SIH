const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },

    role: {
      type: String,
      enum: ["plant", "farmer", "distributor", "buyer", "admin"],
      required: true,
    },

    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, trim: true },
    },

    plantDetails: {
      plantName: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
    },

    farmerDetails: {
      landAreaAcres: { type: Number },
      primaryCrop: { type: String, trim: true },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);