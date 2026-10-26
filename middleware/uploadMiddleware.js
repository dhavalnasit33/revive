
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Store uploaded images in the server/uploads/products folder
const uploadPath = path.join(
    __dirname,
    "..",
    "uploads",
    "products"
);

// Create the folder automatically if it does not exist
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${require("crypto").randomUUID()}${extension}`;

        cb(null, uniqueName);
    }
});

// Allow only the required image formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error("Only JPG, PNG, and WebP images are allowed"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
        files: 1
    }
});

module.exports = upload;
