const Category = require("../models/Category");
const Product = require("../models/Product");

// CREATE CATEGORY
const createCategory = async (req, res) => {
    try {
        const categoryData = {
            ...req.body,
            image: req.file
                ? `/uploads/products/${req.file.filename}`
                : req.body.image || ""
        };

        const category = await Category.create(categoryData);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `Category ${field || "field"} already exists`
            });
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// GET ALL CATEGORIES WITH PRODUCT COUNTS
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .lean();

        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({
                    category: category._id
                });

                return {
                    ...category,
                    productCount
                };
            })
        );

        return res.status(200).json({
            success: true,
            count: categoriesWithCount.length,
            categories: categoriesWithCount
        });

    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch categories",
            error: error.message
        });
    }
};


// GET SINGLE CATEGORY
const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            category
        });

    }
    catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

};


 // UPDATE CATEGORY
const updateCategory = async (req, res) => {
    try {
        const updateData = {
            ...req.body
        };

        // Update image only when a new file is uploaded
        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `Category ${field || "field"} already exists`
            });
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    }
    catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

};


module.exports = {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory
};