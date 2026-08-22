const Batch = require("../models/Batch");
const { checkCompliance } = require("../utils/fcoNorms");
const { generateBatchQR } = require("../utils/qrGenerator");

// Generates a simple unique batch code, e.g. "BATCH-1extract9d2f"
function generateBatchCode() {
  return `BATCH-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
}

exports.createBatch = async (req, res) => {
  try {
    const { labValues, quantityKgTotal, pricePerKg, pickupLocation } = req.body;

    // checkCompliance expects labValues.cnRatio — your schema calls it cToNRatio,
    // so we map it here rather than changing the compliance utility
    const { isCompliant, violations } = checkCompliance({
      ...labValues,
      cnRatio: labValues.cToNRatio,
    });

    const batch = await Batch.create({
      plant: req.user._id,
      batchCode: generateBatchCode(),
      labValues,
      quantityKgTotal,
      quantityKgAvailable: quantityKgTotal, // starts equal to total, decreases as orders come in
      pricePerKg,
      pickupLocation,
      complianceStatus: isCompliant ? "compliant" : "non_compliant",
      complianceViolations: violations,
    });

    const { qrDataUrl, certificateUrl } = await generateBatchQR(batch._id);

    batch.qrCodeDataUrl = qrDataUrl;
    batch.certificateUrl = certificateUrl;
    await batch.save();

    res.status(201).json({ success: true, batch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate("plant", "name email");
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    res.status(200).json({ success: true, batch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.toggleListing = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    if (batch.plant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your batch" });
    }
    if (batch.complianceStatus !== "compliant") {
      return res.status(400).json({ success: false, message: "Cannot list a non-compliant batch" });
    }

    batch.listedInMarketplace = !batch.listedInMarketplace;
    await batch.save();

    res.status(200).json({ success: true, batch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};