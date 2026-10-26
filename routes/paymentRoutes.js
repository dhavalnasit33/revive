
const express = require("express");
const router = express.Router();

const { getPaymentDetails } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Get payment details for a customer's own order
router.get("/:orderId", protect, getPaymentDetails);

module.exports = router;
