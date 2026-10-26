
const express = require("express");
const router = express.Router();

const {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

// Get all addresses of logged-in customer
router.get("/", protect, getAddresses);

// Add a new address
router.post("/", protect, addAddress);

router.put("/:id", protect, updateAddress);

router.delete("/:id", protect, deleteAddress);

module.exports = router;
