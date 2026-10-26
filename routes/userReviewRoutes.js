
const express = require("express");
const router = express.Router();

const {
    getMyReviews,
    getHomepageReviews
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Get approved reviews for the homepage
router.get("/homepage", getHomepageReviews);

// Get reviews written by the logged-in user
router.get("/my-reviews", protect, getMyReviews);

module.exports = router;
