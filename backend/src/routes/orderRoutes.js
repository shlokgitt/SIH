const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getPlantOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/plant-orders", protect, authorize("plant", "admin"), getPlantOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;