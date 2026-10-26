
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },

        slug: {
            type: String,
            required: [true, "Blog slug is required"],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        excerpt: {
            type: String,
            required: [true, "Blog excerpt is required"],
            trim: true,
            maxlength: [500, "Excerpt cannot exceed 500 characters"],
        },

        content: {
            type: String,
            required: [true, "Blog content is required"],
            trim: true,
        },

        coverImage: {
            type: String,
            default: "",
            trim: true,
        },


        images: {
            type: [String],
            default: [],
        },


        category: {
            type: String,
            required: [true, "Blog category is required"],
            trim: true,
        },

        author: {
            type: String,
            default: "LUMORIA",
            trim: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
        },

        readTime: {
            type: Number,
            default: 1,
            min: 1,
        },

        metaTitle: {
            type: String,
            trim: true,
            maxlength: [200, "Meta title cannot exceed 200 characters"],
        },

        metaDescription: {
            type: String,
            trim: true,
            maxlength: [300, "Meta description cannot exceed 300 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Efficiently find published blogs in newest-first order.
blogSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model("Blog", blogSchema);
