const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;