const express = require("express");
const router = express.Router();
const { getDosageAdvisory } = require("../controllers/advisoryController");
const { protect } = require("../middleware/auth");

router.get("/:orderId", protect, getDosageAdvisory);

module.exports = router;