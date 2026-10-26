const express = require("express");
const router = express.Router();

const {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelAdminOrder,
    updatePaymentStatus,
    getOrderStatistics,
    getOrderSummary,
    exportOrdersCSV
} = require("../controllers/adminOrderController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// GET ALL ORDERS
router.get("/", protect, adminOnly, getAllOrders);

// ADMIN ORDER STATISTICS
router.get("/statistics", protect, adminOnly, getOrderStatistics);

router.get("/summary", protect, adminOnly, getOrderSummary);

// ADMIN EXPORT ORDERS
router.get("/export/csv", protect, adminOnly, exportOrdersCSV);

// GET ORDER DETAILS
router.get("/:id", protect, adminOnly, getOrderDetails);

// UPDATE ORDER STATUS
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

router.patch("/:id/cancel", protect, adminOnly, cancelAdminOrder);

// ADMIN UPDATE PAYMENT STATUS
router.patch(
    "/:id/payment-status",
    protect,
    adminOnly,
    updatePaymentStatus
);





module.exports = router;