
const Address = require("../models/Address");

// Add a new address
const addAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            country,
            addressType,
            isDefault
        } = req.body;

        if (
            !fullName ||
            !phone ||
            !addressLine ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required address fields"
            });
        }

        if (isDefault === true || isDefault === "true") {
            await Address.updateMany(
                { user: req.user._id },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            user: req.user._id,
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            country,
            addressType,
            isDefault
        });

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            address
        });
    } catch (error) {
        console.error("Add address error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all addresses of logged-in customer
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user: req.user._id
        }).sort({ isDefault: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: addresses.length,
            addresses
        });
    } catch (error) {
        console.error("Get addresses error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const allowedFields = [
            "fullName",
            "phone",
            "addressLine",
            "city",
            "state",
            "pincode",
            "country",
            "addressType"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update"
            });
        }

        if (
            updates.addressType !== undefined &&
            !["Home", "Office", "Other"].includes(updates.addressType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid address type"
            });
        }

        const address = await Address.findOneAndUpdate(
            {
                _id: id,
                user: req.user._id
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        });
    } catch (error) {
        console.error("Update address error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await address.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete address error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};
