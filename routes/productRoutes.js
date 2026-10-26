
const express = require("express");

const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const validateProduct = require("../validators/productValidator");
const validateProductUpdate = require("../validators/updateProductValidator");

const upload = require("../middleware/uploadMiddleware");


const router = express.Router();

// Anyone can view products
router.get("/", getProducts);
router.get("/:id", getProduct);

// Only logged-in admins can manage products

router.post(
    "/",
    protect,
    adminOnly,
    upload.single("image"),
    validateProduct,
    createProduct
);

router.put(
    "/:id",
    protect,
    adminOnly,
    upload.single("image"),
    validateProductUpdate,
    updateProduct
);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
