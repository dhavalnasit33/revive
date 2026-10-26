
const express = require("express");
const router = express.Router();

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

// Get logged-in customer's wishlist
router.get("/", protect, getWishlist);

// Add product to wishlist
router.post("/add", protect, addToWishlist);

// Remove product from wishlist
router.delete("/remove/:productId", protect, removeFromWishlist);

module.exports = router;
