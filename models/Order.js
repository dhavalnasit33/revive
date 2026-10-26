
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        // Customer who placed the order
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Products included in the order
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                name: {
                    type: String,
                    required: true
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                cancelledQuantity:{
                    type: Number,
                    default: 0,
                    min:0,
                },

                image: {
                    type: String,
                    default: ""
                }
            }
        ],

        // Delivery address saved as a snapshot
        shippingAddress: {
            fullName: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                required: true
            },

            addressLine: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },

            state: {
                type: String,
                required: true
            },

            pincode: {
                type: String,
                required: true
            },

            country: {
                type: String,
                default: "India"
            }
        },

        // Order amount details
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        shippingFee: {
            type: Number,
            default: 0,
            min: 0
        },
        

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Order and payment status
        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending"
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD"
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],
            default: "Pending"
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
