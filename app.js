const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const { adminOnly } = require("./middleware/adminMiddleware");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { doubleCsrf } = require("csrf-csrf");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrder");
const reviewRoutes = require("./routes/reviewRoutes");
const userReviewRoutes = require("./routes/userReviewRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();


const {
    doubleCsrfProtection,
    generateCsrfToken
} = doubleCsrf({
    getSecret: () => process.env.JWT_SECRET,

    getSessionIdentifier: (req) =>
        req.cookies?.token || "anonymous",

    cookieName: "csrf-token",

    cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
    },

    size: 64,

    ignoredMethods: ["GET", "HEAD", "OPTIONS"]
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        success: false,
        Message: "Too many attempts. Please try again after 15 minutes."
    },
    standardHeaders: "draft-8",
    legacyHeaders: false
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);
app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/csrf-token", (req, res) => {
    const csrfToken = generateCsrfToken(req, res);

    res.status(200).json({
        success: true,
        csrfToken
    });
});


app.use("/api/products", doubleCsrfProtection, productRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/reviews", userReviewRoutes);
app.use("/api/products/:productId/reviews", reviewRoutes);
app.use("/api/categories", doubleCsrfProtection, categoryRoutes);
app.use("/api/collections", doubleCsrfProtection, collectionRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Ecommerce API is running"
    });
});

// TEMPORARY PROTECTED ROUTE
app.get("/api/auth/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});


// TEMPORARY ADMIN TEST ROUTE
app.get(
    "/api/auth/admin-test",
    protect,
    adminOnly,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin!"
        });
    }
);
module.exports = app;