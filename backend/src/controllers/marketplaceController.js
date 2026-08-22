const Batch = require("../models/Batch");

exports.browseMarketplace = async (req, res) => {
  try {
    const batches = await Batch.find({
      complianceStatus: "compliant",
      listedInMarketplace: true,
      quantityKgAvailable: { $gt: 0 },
    }).populate("plant", "name");

    res.status(200).json({ success: true, count: batches.length, batches });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getListingDetail = async (req, res) => {
  try {
    const batch = await Batch.findOne({
      _id: req.params.id,
      complianceStatus: "compliant",
      listedInMarketplace: true,
    }).populate("plant", "name");

    if (!batch) {
      return res.status(404).json({ success: false, message: "Listing not found or unavailable" });
    }

    res.status(200).json({ success: true, batch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};