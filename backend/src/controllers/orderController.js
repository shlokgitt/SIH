const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  try {
    const { batchId, quantityKg } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    if (batch.complianceStatus !== "compliant" || !batch.listedInMarketplace) {
      return res.status(400).json({ success: false, message: "Batch not available for purchase" });
    }

    // Atomic stock decrement: the $gte check and the decrement happen as
    // ONE database operation, so two buyers can't both pass a stock check
    // and then both decrement — if quantityKgAvailable is too low, this
    // matches nothing and updatedBatch comes back null.
    const updatedBatch = await Batch.findOneAndUpdate(
      { _id: batchId, quantityKgAvailable: { $gte: quantityKg } },
      { $inc: { quantityKgAvailable: -quantityKg } },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(400).json({ success: false, message: "Not enough stock available" });
    }

    // THE SNAPSHOT — copying the batch's current certified values into the
    // order right now. Plain JS copy, not a reference — nothing here changes
    // if the batch is edited later.
    const totalPrice = quantityKg * batch.pricePerKg;

    const order = await Order.create({
      buyer: req.user._id,
      batch: batch._id,
      batchSnapshot: {
        batchCode: batch.batchCode,
        labValues: batch.labValues,
        complianceStatus: batch.complianceStatus,
      },
      quantityKg,
      pricePerKgAtOrder: batch.pricePerKg,
      totalPrice,
      status: "placed",
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).populate("batch", "batchCode");
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Cancelling restores stock — reverse of the decrement above
    if (status === "cancelled" && order.status !== "cancelled") {
      await Batch.findByIdAndUpdate(order.batch, {
        $inc: { quantityKgAvailable: order.quantityKg },
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};