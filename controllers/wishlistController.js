
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Get logged-in user's wishlist
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({
            user: req.user._id
        }).populate("products");

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: []
            });
        }

        return res.status(200).json({
            success: true,
            wishlist
        });
    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId || !require("mongoose").Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            status: "active"
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or inactive"
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                products: []
            });
        }

        const alreadyAdded = wishlist.products.some(
            id => id.toString() === productId
        );

        if (alreadyAdded) {
            return res.status(400).json({
                success: false,
                message: "Product is already in wishlist"
            });
        }

        wishlist.products.push(productId);

        await wishlist.save();
        await wishlist.populate("products");

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist successfully",
            wishlist
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!require("mongoose").Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required"
            });
        }

        const wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        const productExists = wishlist.products.some(
            id => id.toString() === productId
        );

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        );

        await wishlist.save();
        await wishlist.populate("products");

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            wishlist
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
