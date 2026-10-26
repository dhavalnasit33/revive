
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");



const updateProductRating = async (productId) => {
    const ratingData = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(
                    productId.toString()
                ),
                status: "Approved"
            }
        },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    const averageRating = ratingData.length
        ? Math.round(ratingData[0].averageRating * 10) / 10
        : 0;

    const numReviews = ratingData.length
        ? ratingData[0].numReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
        averageRating,
        numReviews
    });
};



const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        review.status = "Approved";
        await review.save();

        await updateProductRating(review.product);

        return res.status(200).json({
            success: true,
            message: "Review approved successfully",
            review
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve review"
        });
    }
};

const rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        review.status = "Rejected";
        await review.save();

        await updateProductRating(review.product);

        return res.status(200).json({
            success: true,
            message: "Review rejected successfully",
            review
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject review"
        });
    }
};


// GET ALL REVIEWS FOR ADMIN
const getAllReviews = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            rating,
            search
        } = req.query;

        // Validate pagination
        const currentPage = Math.max(
            1,
            parseInt(page, 10) || 1
        );

        const pageLimit = Math.min(
            50,
            Math.max(1, parseInt(limit, 10) || 10)
        );

        // Build filter
        const filter = {};

        // Filter by rating (1 to 5)
        if (rating !== undefined && rating !== "") {
            const ratingValue = Number(rating);

            if (
                !Number.isInteger(ratingValue) ||
                ratingValue < 1 ||
                ratingValue > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }

            filter.rating = ratingValue;
        }

        // Search by customer, product, or comment
        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const searchRegex = new RegExp(
                escapedSearch,
                "i"
            );

            const [userIds, productIds] = await Promise.all([
                User.find({
                    $or: [
                        { name: searchRegex },
                        { email: searchRegex }
                    ]
                }).distinct("_id"),

                Product.find({
                    name: searchRegex
                }).distinct("_id")
            ]);

            filter.$or = [
                { user: { $in: userIds } },
                { product: { $in: productIds } },
                { comment: searchRegex }
            ];
        }

        // Fetch reviews and total count
        const [reviews, totalReviews] = await Promise.all([
            Review.find(filter)
                .populate("user", "name email")
                .populate("product", "name price")
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * pageLimit)
                .limit(pageLimit)
                .lean(),

            Review.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            totalReviews,
            currentPage,
            totalPages: Math.ceil(totalReviews / pageLimit),
            reviews
        });

    } catch (error) {
        console.error("Get all reviews error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};


const getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Validate review ID
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        // Find review with customer and product details
        const review = await Review.findById(reviewId)
            .populate("user", "name email")
            .populate("product", "name price images");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            review
        });

    } catch (error) {
        console.error("Get review by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch review"
        });
    }
};


const deleteReviewByAdmin = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // 1. Validate review ID
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        // 2. Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // 3. Remember the product ID before deleting
        const productId = review.product;

        // 4. Delete the review
        await Review.findByIdAndDelete(reviewId);

        // 5. Calculate the updated product rating
        const ratingData = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(
                        productId.toString()
                    ),
                      status: "Approved"
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: { $avg: "$rating" },
                    numReviews: { $sum: 1 }
                }
            }
        ]);

        const averageRating = ratingData.length
            ? Math.round(ratingData[0].averageRating * 10) / 10
            : 0;

        const numReviews = ratingData.length
            ? ratingData[0].numReviews
            : 0;

        // 6. Update the product
        await Product.findByIdAndUpdate(
            productId,
            {
                averageRating,
                numReviews
            },
            {
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            productRating: {
                averageRating,
                numReviews
            }
        });

    } catch (error) {
        console.error("Admin delete review error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
};



const getReviewStats = async (req, res) => {
    try {
        // Calculate total reviews and average rating
        const overallStats = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        // Count reviews for each star rating
        const ratingBreakdown = await Review.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);

        const totalReviews = overallStats.length
            ? overallStats[0].totalReviews
            : 0;

        const averageRating = overallStats.length
            ? Math.round(overallStats[0].averageRating * 10) / 10
            : 0;

        // Ensure all ratings from 1 to 5 are present
        const ratings = [1, 2, 3, 4, 5].map((star) => {
            const found = ratingBreakdown.find(
                (item) => item._id === star
            );

            return {
                rating: star,
                count: found ? found.count : 0
            };
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalReviews,
                averageRating,
                ratings
            }
        });
    } catch (error) {
        console.error("Get review stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch review statistics"
        });
    }
};




module.exports = {
    getAllReviews,
    getReviewById,
    deleteReviewByAdmin,
    getReviewStats,
    approveReview,
    rejectReview,
};
