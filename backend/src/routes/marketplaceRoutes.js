const express = require("express");
const router = express.Router();
const { browseMarketplace, getListingDetail } = require("../controllers/marketplaceController");

// Public — buyers browse without needing to log in first
router.get("/", browseMarketplace);
router.get("/:id", getListingDetail);

module.exports = router;