const Order = require("../models/Order");

// Simple dosage recommendation logic based on the order's snapshotted
// lab values. This is a starting formula — you can refine the actual
// agronomic logic later, but the pipeline (order -> snapshot -> dosage) works.
function calculateDosage(labValues, cropAreaAcres) {
  // Base dosage in kg per acre, adjusted by nitrogen content.
  // Higher nitrogen % → less quantity needed per acre, and vice versa.
  const baseDosagePerAcre = 500; // kg, a reasonable starting baseline
  const nitrogenFactor = 1.5 / (labValues.nitrogen || 1); // avoid divide-by-zero

  const recommendedKgPerAcre = Math.round(baseDosagePerAcre * nitrogenFactor);
  const totalRecommendedKg = recommendedKgPerAcre * cropAreaAcres;

  return { recommendedKgPerAcre, totalRecommendedKg };
}

// GET dosage advisory for a specific order the buyer placed
exports.getDosageAdvisory = async (req, res) => {
  try {
    const { cropAreaAcres } = req.query;
    if (!cropAreaAcres || cropAreaAcres <= 0) {
      return res.status(400).json({ success: false, message: "cropAreaAcres query param is required" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only the buyer who placed the order can get advisory for it
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your order" });
    }

    // READS FROM THE SNAPSHOT, not the live Batch — this is the whole point.
    // Even if the plant edited the batch's labValues after this order was
    // placed, the dosage here still reflects what was actually certified
    // and paid for at purchase time.
    const { recommendedKgPerAcre, totalRecommendedKg } = calculateDosage(
      order.batchSnapshot.labValues,
      Number(cropAreaAcres)
    );

    res.status(200).json({
      success: true,
      batchCode: order.batchSnapshot.batchCode,
      labValuesUsed: order.batchSnapshot.labValues,
      cropAreaAcres: Number(cropAreaAcres),
      recommendedKgPerAcre,
      totalRecommendedKg,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};