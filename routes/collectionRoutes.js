const express = require("express");

const {
    createCollection,
    getCollections,
    getCollection,
    updateCollection,
    deleteCollection
} = require("../controllers/collectionController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const validateCollection = require("../validators/collectionValidator");
const validateCollectionUpdate = require("../validators/updateCollectionValidator");

const router = express.Router();

// Anyone can view collections
router.get("/", getCollections);
router.get("/:id", getCollection);

// Only logged-in admins can manage collections
router.post(
    "/",
    protect,
    adminOnly,
    upload.single("image"),
    validateCollection,
    createCollection
);
router.put(
    "/:id",
    protect,
    adminOnly,
     upload.single("image"),
    validateCollectionUpdate,
    updateCollection
);
router.delete("/:id", protect, adminOnly, deleteCollection);

module.exports = router;;