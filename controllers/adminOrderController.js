const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// 1. GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10, startDate, endDate } = req.query;


        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};

            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1);
                dateFilter.createdAt.$lt = end;
            }
        }

        // VALIDATE DATE FILTERS
        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date"
            });
        }

        if (endDate && isNaN(Date.parse(endDate))) {
            return res.status(400).json({
                success: false,
                message: "Invalid end date"
            });
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after end date"
            });
        }
        const filter = {};

        // Filter orders by status
        if (status) {
            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order status"
                });
            }

            filter.orderStatus = status;
        }

        // Search by customer name or email
        if (search) {
            const users = await mongoose
                .model("User")
                .find({
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } }
                    ]
                })
                .select("_id");

            filter.user = { $in: users.map(user => user._id) };
        }

        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.min(
            100,
            Math.max(1, parseInt(limit, 10) || 10)
        );

        const skip = (pageNumber - 1) * limitNumber;

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .populate("user", "name email phone")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Order.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            totalOrders,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / limitNumber),
            orders
        });

    } catch (error) {
        console.error("GET ALL ORDERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch orders"
        });
    }
};


// 2. GET SINGLE ORDER DETAILS (ADMIN)
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id)
            .populate("user", "name email phone")
            .populate("items.product", "name images price stock")
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("GET ORDER DETAILS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order details"
        });
    }
};


// 3. UPDATE ORDER STATUS (ADMIN)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Cancellation must use the existing cancellation API
        // so that product stock is restored correctly.
        if (orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Use the cancellation API to cancel an order"
            });
        }

        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be updated"
            });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered orders cannot be updated"
            });
        }

        order.orderStatus = orderStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update order status"
        });
    }
};


// ADMIN CANCEL ORDER
const cancelAdminOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        await session.withTransaction(async () => {
            const order = await Order.findById(id).session(session);

            if (!order) {
                const error = new Error("Order not found");
                error.statusCode = 404;
                throw error;
            }

            if (order.orderStatus === "Cancelled") {
                const error = new Error("Order is already cancelled");
                error.statusCode = 400;
                throw error;
            }

            if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
                const error = new Error(
                    "Only Pending or Confirmed orders can be cancelled"
                );
                error.statusCode = 400;
                throw error;
            }

            // Restore stock for each ordered product
            for (const item of order.items) {
                const result = await Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: item.quantity } },
                    { session }
                );

                if (result.matchedCount === 0) {
                    const error = new Error(
                        `Product not found: ${item.product}`
                    );
                    error.statusCode = 400;
                    throw error;
                }
            }

            // Mark order as cancelled in the same transaction
            order.orderStatus = "Cancelled";
            await order.save({ session });
        });

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully and stock restored"
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to cancel order"
        });
    } finally {
        await session.endSession();
    }
};


// ADMIN UPDATE PAYMENT STATUS
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const allowedStatuses = [
            "Pending",
            "Paid",
            "Failed",
            "Refunded"
        ];

        if (!allowedStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === "Cancelled" &&
            paymentStatus !== "Refunded" &&
            paymentStatus !== "Failed") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders can only be marked Refunded or Failed"
            });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            paymentStatus: order.paymentStatus
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update payment status"
        });
    }
};


// ADMIN ORDER STATISTICS
const getOrderStatistics = async (req, res) => {
    try {
        const statistics = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        const statuses = [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        const result = statuses.map((status) => {
            const found = statistics.find(
                (item) => item._id === status
            );

            return {
                status,
                count: found ? found.count : 0,
                totalAmount: found ? found.totalAmount : 0
            };
        });

        return res.status(200).json({
            success: true,
            statistics: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch order statistics"
        });
    }
};

// ADMIN DASHBOARD SUMMARY
const getOrderSummary = async (req, res) => {
    try {
        const summary = await Order.aggregate([
            {
                $group: {
                    _id: null,

                    totalOrders: { $sum: 1 },

                    pendingOrders: {
                        $sum: {
                            $cond: [
                                { $eq: ["$orderStatus", "Pending"] },
                                1,
                                0
                            ]
                        }
                    },

                    deliveredOrders: {
                        $sum: {
                            $cond: [
                                { $eq: ["$orderStatus", "Delivered"] },
                                1,
                                0
                            ]
                        }
                    },

                    cancelledOrders: {
                        $sum: {
                            $cond: [
                                { $eq: ["$orderStatus", "Cancelled"] },
                                1,
                                0
                            ]
                        }
                    },

                    deliveredRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$orderStatus", "Delivered"] },
                                "$totalAmount",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = summary[0] || {
            totalOrders: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            deliveredRevenue: 0
        };

        delete result._id;

        return res.status(200).json({
            success: true,
            summary: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch order summary"
        });
    }
};



// ADMIN EXPORT ORDERS TO CSV
const exportOrdersCSV = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        const filter = {};

        if (status) {
            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order status"
                });
            }

            filter.orderStatus = status;
        }

        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                const start = new Date(startDate);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid start date"
                    });
                }

                filter.createdAt.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid end date"
                    });
                }

                end.setDate(end.getDate() + 1);
                filter.createdAt.$lt = end;
            }
        }

        if (
            startDate &&
            endDate &&
            new Date(startDate) > new Date(endDate)
        ) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after end date"
            });
        }

        const orders = await Order.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .lean();

        const escapeCSV = (value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
        };

        const headers = [
            "Order ID",
            "Customer Name",
            "Customer Email",
            "Order Status",
            "Payment Status",
            "Payment Method",
            "Subtotal",
            "Shipping Fee",
            "Total Amount",
            "Order Date"
        ];

        const rows = orders.map((order) => [
            order._id,
            order.user?.name || "",
            order.user?.email || "",
            order.orderStatus,
            order.paymentStatus,
            order.paymentMethod,
            order.subtotal,
            order.shippingFee,
            order.totalAmount,
            order.createdAt
                ? new Date(order.createdAt).toISOString()
                : ""
        ]);

        const csv = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(","))
        ].join("\r\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="jewellery-orders.csv"'
        );

        return res.status(200).send("\uFEFF" + csv);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to export orders"
        });
    }
};


module.exports = {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelAdminOrder,
    updatePaymentStatus,
    getOrderStatistics,
    getOrderSummary,
    exportOrdersCSV
};