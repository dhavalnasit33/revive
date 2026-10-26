
const express = require("express");
const router = express.Router();

const {
    getAllReviews,
    getReviewById,
    deleteReviewByAdmin,
    getReviewStats,
    approveReview,
    rejectReview
} = require("../controllers/adminReviewController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Admin: Get all customer reviews
router.get("/", protect, adminOnly, getAllReviews);


router.get("/stats", protect, adminOnly, getReviewStats);


// Keep your existing middleware imports and GET all reviews route.

router.get("/:reviewId", protect, adminOnly, getReviewById);

router.delete(
    "/:reviewId",
    protect,
    adminOnly,
    deleteReviewByAdmin
);


router.patch(
    "/:reviewId/approve",
    protect,
    adminOnly,
    approveReview
);

router.patch(
    "/:reviewId/reject",
    protect,
    adminOnly,
    rejectReview
);

module.exports = router;
