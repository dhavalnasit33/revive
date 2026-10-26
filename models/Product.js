const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discountPrice: {
            type: Number,
            default: 0,
            min: 0
        },

        images: [
            {
                type: String
            }
        ],

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        collection: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection"
        },

        material: {
            type: String
        },

        weight: {
            type: Number
        },

        size: {
            type: String
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        sku: {
            type: String,
            unique: true,
            required: true
        },

        featured: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        
        numReviews: {
            type: Number,
            default: 0,
            min: 0
        }


    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;