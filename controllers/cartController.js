
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET CUSTOMER CART
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate("items.product");

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: []
            });
        }

        return res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product ID
        if (!productId || !require("mongoose").Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required"
            });
        }

        // Validate quantity
        const qty = Number(quantity);

        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        // Find an active product
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

        // Check available stock
        if (product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: "Not enough stock available"
            });
        }

        // Find or create the customer's cart
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }

        // Check whether this product is already in the cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + qty > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock"
                });
            }

            existingItem.quantity += qty;
        } else {
            cart.items.push({
                product: productId,
                quantity: qty
            });
        }

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!require("mongoose").Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required"
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemExists = cart.items.some(
            item => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart
        });
    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!require("mongoose").Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required"
            });
        }

        const qty = Number(quantity);

        if (
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !Number.isInteger(qty) ||
            qty < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cartItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
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

        if (qty > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Not enough stock available"
            });
        }

        cartItem.quantity = qty;

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart
        });
    } catch (error) {
        console.error("Update cart quantity error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity
};
