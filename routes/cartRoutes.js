
const express = require("express");
const router = express.Router();

const {
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// Get the logged-in customer's cart
router.get("/", protect, getCart);

// Add a product to the cart
router.post("/add", protect, addToCart);

// Remove a product from the cart
router.delete("/remove/:productId", protect, removeFromCart);

// Update product quantity in cart
router.put("/update/:productId", protect, updateCartQuantity);

module.exports = router;
