
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");

// Create order from customer's cart
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { addressId, paymentMethod = "COD" } = req.body;

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Valid address ID is required"
            });
        }

        if (!["COD", "Online"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        const address = await Address.findOne({
            _id: addressId,
            user: req.user._id
        }).lean();

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Delivery address not found"
            });
        }
        console.log("Logged-in user ID:", req.user._id);
        console.log("Requested address ID:", addressId);

        const cart = await Cart.findOne({
            user: req.user._id
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const orderItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = item.product;

            if (!product || product.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is unavailable"
                });
            }

            if (
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                product.stock < item.quantity
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const price = Number(
                product.discountPrice > 0
                    ? product.discountPrice
                    : product.price
            );

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product price"
                });
            }

            subtotal += price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price,
                quantity: item.quantity,
                image: product.images?.[0] || ""
            });
        }

        const shippingFee = 0;
        const totalAmount = subtotal + shippingFee;

        let createdOrder;

        await session.withTransaction(async () => {
            // Re-check stock and decrease it safely.
            for (const item of orderItems) {
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        status: "active",
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!updatedProduct) {
                    throw new Error("INSUFFICIENT_STOCK");
                }
            }

            const orders = await Order.create(
                [{
                    user: req.user._id,
                    items: orderItems,
                    shippingAddress: {
                        fullName: address.fullName,
                        phone: address.phone,
                        addressLine: address.addressLine,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        country: address.country
                    },
                    subtotal,
                    shippingFee,
                    totalAmount,
                    paymentMethod,
                    paymentStatus: "Pending"
                }],
                { session }
            );

            createdOrder = orders[0];

            await Cart.updateOne(
                { _id: cart._id },
                { $set: { items: [] } },
                { session }
            );
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: createdOrder
        });
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        console.error("ERROR MESSAGE:", error.message);
        console.error("ERROR STACK:", error.stack);

        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({
                success: false,
                message: "Stock changed or is insufficient. Please review your cart."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create order",
            error: error.message // Development testing only
        });
    } finally {
        await session.endSession();
    }
};


const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            orderStatus: { $ne: "Cancelled" }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch your orders"
        });
    }
};



const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id,
            orderStatus: { $ne: "Cancelled" }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order details error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order details"
        });
    }
};


const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        let cancelledOrder;

        await session.withTransaction(async () => {
            // Find this user's order.
            const existingOrder = await Order.findOne({
                _id: id,
                user: req.user._id,
            }).session(session);

            if (!existingOrder) {
                throw new Error("ORDER_NOT_FOUND");
            }

            // Cancel only if the order is still Pending.
            const order = await Order.findOneAndUpdate(
                {
                    _id: id,
                    user: req.user._id,
                    orderStatus: "Pending",
                },
                {
                    $set: { orderStatus: "Cancelled" },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!order) {
                throw new Error("ORDER_CANNOT_BE_CANCELLED");
            }

            // Restore stock inside the same transaction.
            for (const item of order.items) {
                const updatedProduct = await Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: { stock: item.quantity },
                    },
                    {
                        new: true,
                        session,
                    }
                );

                if (!updatedProduct) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
            }

            cancelledOrder = order;
        });

        return res.status(200).json({
            success: true,
            message: "Order cancelled and stock restored successfully",
            order: cancelledOrder,
        });
    } catch (error) {
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (error.message === "ORDER_CANNOT_BE_CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled or cannot be cancelled",
            });
        }

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(400).json({
                success: false,
                message: "A product in this order could not be found",
            });
        }

        console.error("CANCEL ORDER ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel order",
        });
    } finally {
        await session.endSession();
    }
};



const cancelOrderItems = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const { productId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        let updatedOrder;

        await session.withTransaction(async () => {
            const order = await Order.findOne({
                _id: id,
                user: req.user._id,
            }).session(session);

            if (!order) {
                throw new Error("ORDER_NOT_FOUND");
            }

            if (order.orderStatus !== "Pending") {
                throw new Error("ORDER_CANNOT_BE_CANCELLED");
            }

            const item = order.items.find(
                (entry) => entry.product.toString() === productId
            );

            if (!item) {
                throw new Error("PRODUCT_NOT_IN_ORDER");
            }

            const remainingQuantity = item.quantity;

            if (quantity >= remainingQuantity) {
                throw new Error("INVALID_CANCEL_QUANTITY");
            }

            const product = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: quantity } },
                { new: true, session }
            );

            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            item.cancelledQuantity = (item.cancelledQuantity || 0) + quantity;

            // Reduce the quantity that remains in the order.
            item.quantity -= quantity;

            // Recalculate the order amount for the remaining quantity.
            order.subtotal = order.items.reduce(
                (total, orderItem) =>
                    total + orderItem.price * orderItem.quantity,
                0
            );

            order.totalAmount = order.subtotal + order.shippingFee;

            // If all items have been cancelled, cancel the whole order.
            const allItemsCancelled = order.items.every(
                (orderItem) => orderItem.quantity === 0
            );

            if (allItemsCancelled) {
                order.orderStatus = "Cancelled";
            }

            await order.save({ session });

            updatedOrder = order;
        });

        return res.status(200).json({
            success: true,
            message: "Selected quantity cancelled successfully",
            order: updatedOrder,
        });
    } catch (error) {
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (error.message === "ORDER_CANNOT_BE_CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be partially cancelled",
            });
        }

        if (error.message === "PRODUCT_NOT_IN_ORDER") {
            return res.status(404).json({
                success: false,
                message: "Product not found in this order",
            });
        }

        if (error.message === "INVALID_CANCEL_QUANTITY") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel more than the remaining quantity",
            });
        }

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        console.error("PARTIAL CANCELLATION ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel selected quantity",
        });
    } finally {
        await session.endSession();
    }
};


module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    cancelOrderItems
};
