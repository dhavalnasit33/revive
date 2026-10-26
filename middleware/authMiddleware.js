
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = req.cookies?.token;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        let account;

        // Find the account in the correct collection
        if (decoded.role === "admin") {
            account = await Admin.findById(decoded.id)
                .select("-password");
        } else {
            account = await User.findById(decoded.id)
                .select("-password");
        }

        if (!account || !account.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or account inactive"
            });
        }

        req.user = account;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again"
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.userRole === "admin") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
    });
};

module.exports = { protect, adminOnly };
