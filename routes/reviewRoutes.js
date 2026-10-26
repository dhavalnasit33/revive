const express = require("express");
const router = express.Router({ mergeParams: true });

const {
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getHomepageReviews
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Homepage: get approved reviews across all products
router.get("/homepage", getHomepageReviews);

// Product-specific reviews
router.get("/", getProductReviews);

// Add a review (login required)
router.post("/", protect, addReview);

// Update a review
router.put("/:reviewId", protect, updateReview);

// Delete a review
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;