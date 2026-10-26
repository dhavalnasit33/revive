const Product = require("../models/Product");



const sendProductError = (res, error) => {
    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate value. Please use a unique SKU."
        });
    }

    console.error("Product error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};



// CREATE PRODUCT


const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        // Save the uploaded image in the images array
        if (req.file) {
            productData.images = [
                `/uploads/products/${req.file.filename}`
            ];
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        return sendProductError(res, error);
    }
};



// GET ALL PRODUCTS
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // SEARCH
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { material: { $regex: search, $options: "i" } }
            ];
        }

        // CATEGORY FILTER
        if (category) {
            query.category = category;
        }

        // PRICE FILTER
        if (minPrice || maxPrice) {
            query.price = {};

            if (minPrice) {
                query.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                query.price.$lte = Number(maxPrice);
            }
        }

        // PAGINATION
        const skip = (Number(page) - 1) * Number(limit);

        // SORTING
        let sortOption = {};

        if (sort === "price-low") {
            sortOption.price = 1;
        } else if (sort === "price-high") {
            sortOption.price = -1;
        } else if (sort === "newest") {
            sortOption.createdAt = -1;
        } else {
            sortOption.createdAt = -1;
        }

        const products = await Product.find(query)
            .populate("category", "name slug")
            .populate("collection", "name slug")
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProducts / Number(limit)),
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE PRODUCT
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    }  catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// UPDATE PRODUCT

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Get the final price
        const updatedPrice =
            req.body.price !== undefined
                ? Number(req.body.price)
                : product.price;

        // Get the final discount price
        const updatedDiscountPrice =
            req.body.discountPrice !== undefined
                ? Number(req.body.discountPrice)
                : product.discountPrice;

        // Validate discount price
        if (updatedDiscountPrice > updatedPrice) {
            return res.status(400).json({
                success: false,
                message: "Discount price cannot exceed product price"
            });
        }

        // Update the normal product fields
        product.set(req.body);

        // Save the new image path when an image is uploaded
        if (req.file) {
            product.images = [
                `/uploads/products/${req.file.filename}`
            ];
        }

        // Save the product
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        return sendProductError(res, error);
    }
};



// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
};