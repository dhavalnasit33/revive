
const adminOnly = (req, res, next) => {
    // Check the role verified by the protect middleware
    if (req.user && req.userRole === "admin") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
    });
};

module.exports = { adminOnly };
