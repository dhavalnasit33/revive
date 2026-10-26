
const express = require("express");

const {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const validateCategory = require("../validators/categoryValidator");
const validateCategoryUpdate = require("../validators/updateCategoryValidator");
const upload = require("../middleware/uploadMiddleware");


const router = express.Router();

// Public routes: Anyone can view categories
router.get("/", getCategories);
router.get("/:id", getCategory);

// Admin-only routes: Manage categories
router.post(
    "/",
    protect,
    adminOnly,
    upload.single("image"),
    validateCategory,
    createCategory
);
router.put(
    "/:id",
    protect,
    adminOnly,
     upload.single("image"),
    validateCategoryUpdate,
    updateCategory
);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
