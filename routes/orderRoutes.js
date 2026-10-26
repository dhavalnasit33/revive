
const express = require("express");
const router = express.Router();

const { 
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    cancelOrderItems
 } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// Create a new order from the user's cart
router.post("/", protect, createOrder);

// Get all orders of the logged-in customer
router.get("/my-orders", protect, getMyOrders);


// Get details of a single order
router.get("/:id", protect, getOrderById);

router.patch("/:id/cancel", protect, cancelOrder);

router.patch("/:id/cancel-items", protect, cancelOrderItems);

module.exports = router;
