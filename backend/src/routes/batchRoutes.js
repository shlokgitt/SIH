const express = require("express");
const router = express.Router();
const { createBatch, getCertificate, toggleListing } = require("../controllers/batchController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("plant"), createBatch);
router.get("/certificate/:id", getCertificate);
router.patch("/:id/toggle-listing", protect, authorize("plant"), toggleListing);

module.exports = router;