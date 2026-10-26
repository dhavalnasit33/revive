const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");


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
};



// ADD PRODUCT REVIEW
const addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        if (
            typeof comment !== "string" ||
            comment.trim().length < 3 ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be between 3 and 1000 characters"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating: Number(rating),
            comment: comment.trim()
        });

        // Update product's average rating and review count
        await updateProductRating(productId);


        const populatedReview = await Review.findById(review._id)
            .populate("user", "name");

        return res.status(201).json({
            success: true,
            message: "Product review added successfully",
            review: populatedReview
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add review"
        });
    }
};


// GET APPROVED REVIEWS FOR HOMEPAGE
const getHomepageReviews = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            30,
            Math.max(1, parseInt(req.query.limit, 10) || 6)
        );

        const filter = {
            status: "Approved"
        };

        const [reviews, totalReviews, ratingStats] = await Promise.all([
            Review.find(filter)
                .populate("user", "name")
                .populate("product", "name")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            Review.countDocuments(filter),

            Review.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 }
                    }
                }
            ])
        ]);

        return res.status(200).json({
            success: true,
            totalReviews,
            currentPage: page,
            totalPages: Math.ceil(totalReviews / limit),
            averageRating: ratingStats.length
                ? Number(ratingStats[0].averageRating.toFixed(1))
                : 0,
            reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch homepage reviews"
        });
    }
};


// GET PRODUCT REVIEWS
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            page = 1,
            limit = 10,
            rating
        } = req.query;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const pageLimit = Math.min(
            50,
            Math.max(1, parseInt(limit, 10) || 10)
        );

        const filter = {
            product: productId,
            status: "Approved"
        };

        if (rating !== undefined) {
            const ratingValue = Number(rating);

            if (!Number.isInteger(ratingValue) ||
                ratingValue < 1 ||
                ratingValue > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating filter must be between 1 and 5"
                });
            }

            filter.rating = ratingValue;
        }

        const [reviews, totalReviews, ratingStats] = await Promise.all([
            Review.find(filter)
                .populate("user", "name")
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * pageLimit)
                .limit(pageLimit)
                .lean(),

            Review.countDocuments(filter),

            Review.aggregate([
                { $match: { product: new mongoose.Types.ObjectId(productId) } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: "$rating" },
                        totalRatings: { $sum: 1 }
                    }
                }
            ])
        ]);

        return res.status(200).json({
            success: true,
            totalReviews,
            currentPage,
            totalPages: Math.ceil(totalReviews / pageLimit),
            averageRating: ratingStats.length
                ? Number(ratingStats[0].averageRating.toFixed(1))
                : 0,
            reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch reviews"
        });
    }
};



const updateReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const { rating, comment } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(reviewId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or review ID"
            });
        }

        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        if (
            typeof comment !== "string" ||
            comment.trim().length < 3 ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be between 3 and 1000 characters"
            });
        }

        const review = await Review.findOne({
            _id: reviewId,
            product: productId,
            user: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or you are not authorized to update it"
            });
        }

        review.rating = Number(rating);
        review.comment = comment.trim();

        await review.save();

        // ADD THIS LINE
        await updateProductRating(productId);

        const updatedReview = await Review.findById(review._id)
            .populate("user", "name");

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update review"
        });
    }
};


const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(reviewId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or review ID"
            });
        }

        const review = await Review.findOneAndDelete({
            _id: reviewId,
            product: productId,
            user: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or you are not authorized to delete it"
            });
        }

        // Recalculate product rating and review count
        await updateProductRating(productId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete review"
        });
    }
};



const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            user: req.user._id
        })
            .populate("product", "name price images")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalReviews: reviews.length,
            reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch your reviews"
        });
    }
};


module.exports = {
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getMyReviews,
    getHomepageReviews
};