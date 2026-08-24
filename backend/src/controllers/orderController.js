const Batch = require("../models/Batch");
const Order = require("../models/Order");

// @desc    Place a new bulk order for a certified organic manure batch
// @route   POST /api/orders
// @access  Private (Buyer / Farmer / Distributor)
exports.placeOrder = async (req, res) => {
  try {
    const { batchId, quantityKg } = req.body;

    if (!batchId || !quantityKg || Number(quantityKg) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid batchId and a positive quantityKg",
      });
    }

    const orderQty = Number(quantityKg);

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    if (batch.complianceStatus !== "compliant" || !batch.listedInMarketplace) {
      return res.status(400).json({
        success: false,
        message: "Batch is not available for purchase in marketplace",
      });
    }

    // Atomic stock decrement using $gte check to ensure stock availability under concurrency
    const updatedBatch = await Batch.findOneAndUpdate(
      { _id: batchId, quantityKgAvailable: { $gte: orderQty } },
      { $inc: { quantityKgAvailable: -orderQty } },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock available. Requested: ${orderQty} kg, Available: ${batch.quantityKgAvailable} kg`,
      });
    }

    const totalPrice = orderQty * batch.pricePerKg;

    // IMMUTABLE SNAPSHOT: Preserve certified lab values & batch details at order time
    const order = await Order.create({
      buyer: req.user._id,
      batch: batch._id,
      batchSnapshot: {
        batchCode: batch.batchCode,
        labValues: batch.labValues,
        complianceStatus: batch.complianceStatus,
      },
      quantityKg: orderQty,
      pricePerKgAtOrder: batch.pricePerKg,
      totalPrice,
      status: "placed",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders placed by the logged-in buyer
// @route   GET /api/orders/my-orders
// @access  Private (Buyer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("batch", "batchCode pricePerKg pickupLocation complianceStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders received for batches produced by the logged-in plant
// @route   GET /api/orders/plant-orders
// @access  Private (Plant / Admin)
exports.getPlantOrders = async (req, res) => {
  try {
    // Find all batches produced by this plant
    const plantBatches = await Batch.find({ plant: req.user._id }).select("_id");
    const batchIds = plantBatches.map((b) => b._id);

    const orders = await Order.find({ batch: { $in: batchIds } })
      .populate("buyer", "name email phone location farmerDetails")
      .populate("batch", "batchCode pricePerKg quantityKgAvailable")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single order detail by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email phone location")
      .populate("batch", "batchCode pricePerKg pickupLocation plant");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check authorization: only the buyer or the producing plant can view order details
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    let isPlantOwner = false;
    if (order.batch && order.batch.plant) {
      isPlantOwner = order.batch.plant.toString() === req.user._id.toString();
    }

    if (!isBuyer && !isPlantOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update order status (placed, confirmed, delivered, cancelled)
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["placed", "confirmed", "delivered", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Restoring stock if order is cancelled
    if (status === "cancelled" && order.status !== "cancelled") {
      await Batch.findByIdAndUpdate(order.batch, {
        $inc: { quantityKgAvailable: order.quantityKg },
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      order,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};