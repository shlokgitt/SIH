const Batch = require("../models/Batch");

// Haversine formula to compute distance in kilometers between two lat/lng coordinates
function calculateDistanceInKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// @desc    Browse marketplace listings (compliant + listed + in stock) with optional location matching & filtering
// @route   GET /api/marketplace/batches
// @access  Public
exports.browseMarketplace = async (req, res) => {
  try {
    const { lat, lng, maxDistanceKm, maxPrice, minQuantity, search } = req.query;

    const query = {
      complianceStatus: "compliant",
      listedInMarketplace: true,
      quantityKgAvailable: { $gt: 0 },
    };

    if (maxPrice) {
      query.pricePerKg = { $lte: Number(maxPrice) };
    }

    if (minQuantity) {
      query.quantityKgAvailable = {
        ...query.quantityKgAvailable,
        $gte: Number(minQuantity),
      };
    }

    if (search) {
      query.batchCode = { $regex: search.trim(), $options: "i" };
    }

    let batches = await Batch.find(query)
      .populate("plant", "name email phone plantDetails location")
      .sort({ createdAt: -1 });

    const buyerLat = lat ? parseFloat(lat) : null;
    const buyerLng = lng ? parseFloat(lng) : null;

    // Attach distance calculation if buyer coordinates are provided
    let processedBatches = batches.map((batchDoc) => {
      const batch = batchDoc.toObject();
      let distanceKm = null;
      if (buyerLat !== null && buyerLng !== null && batch.pickupLocation) {
        distanceKm = calculateDistanceInKm(
          buyerLat,
          buyerLng,
          batch.pickupLocation.lat,
          batch.pickupLocation.lng
        );
      }
      return { ...batch, distanceKm };
    });

    // Filter by max distance if requested
    if (maxDistanceKm && buyerLat !== null && buyerLng !== null) {
      const maxDist = parseFloat(maxDistanceKm);
      processedBatches = processedBatches.filter(
        (b) => b.distanceKm !== null && b.distanceKm <= maxDist
      );
    }

    // Sort by distance if location provided
    if (buyerLat !== null && buyerLng !== null) {
      processedBatches.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    res.status(200).json({
      success: true,
      count: processedBatches.length,
      batches: processedBatches,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single marketplace listing detail
// @route   GET /api/marketplace/batches/:id
// @access  Public
exports.getListingDetail = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const batch = await Batch.findOne({
      _id: req.params.id,
      complianceStatus: "compliant",
      listedInMarketplace: true,
    }).populate("plant", "name email phone plantDetails location");

    if (!batch) {
      return res.status(404).json({ success: false, message: "Listing not found or unavailable" });
    }

    const result = batch.toObject();
    if (lat && lng && result.pickupLocation) {
      result.distanceKm = calculateDistanceInKm(
        parseFloat(lat),
        parseFloat(lng),
        result.pickupLocation.lat,
        result.pickupLocation.lng
      );
    }

    res.status(200).json({ success: true, batch: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};