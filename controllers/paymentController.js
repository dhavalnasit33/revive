
const mongoose = require("mongoose");
const Order = require("../models/Order");

// Get payment details for the logged-in customer's order
const getPaymentDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id
        }).select(
            "paymentMethod paymentStatus totalAmount orderStatus createdAt"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            payment: {
                orderId: order._id,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error("Get payment details error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch payment details"
        });
    }
};

module.exports = {
    getPaymentDetails
};
