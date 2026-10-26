
const Collection = require("../models/Collection");

// CREATE COLLECTION
const createCollection = async (req, res) => {
    try {
        const collectionData = {
            ...req.body,
            image: req.file
                ? `/uploads/products/${req.file.filename}`
                : req.body.image || ""
        };

        const collection = await Collection.create(collectionData);

        return res.status(201).json({
            success: true,
            message: "Collection created successfully",
            collection
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `Collection ${field || "field"} already exists`
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

        console.error("Collection error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// GET ALL COLLECTIONS
const getCollections = async (req, res) => {
    try {
        const collections = await Collection.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: collections.length,
            collections
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET SINGLE COLLECTION
const getCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        return res.status(200).json({
            success: true,
            collection
        });

    } catch (error) {
        console.error("Get collection error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// UPDATE COLLECTION
const updateCollection = async (req, res) => {
    try {
        const updateData = {
            ...req.body
        };

        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        const collection = await Collection.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Collection updated successfully",
            collection
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `Collection ${field || "field"} already exists`
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

        console.error("Update collection error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// DELETE COLLECTION
const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findByIdAndDelete(req.params.id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Collection deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCollection,
    getCollections,
    getCollection,
    updateCollection,
    deleteCollection
};
