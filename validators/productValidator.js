
const { body, validationResult } = require("express-validator");

const validateProduct = [
    // 1. Product name is required
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required"),

    // 2. Description is required
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Product description is required"),

    // 3. Price must be zero or greater
    body("price")
        .notEmpty()
        .withMessage("Product price is required")
        .bail()
        .isFloat({ min: 0 })
        .withMessage("Price must be zero or greater"),

    // 4. Discount price must be zero or greater
    body("discountPrice")
        .optional({ values: "null" })
        .isFloat({ min: 0 })
        .withMessage("Discount price must be zero or greater")
        .custom((value, { req }) => {
            if (
                req.body.price !== undefined &&
                Number(value) > Number(req.body.price)
            ) {
                throw new Error(
                    "Discount price cannot exceed product price"
                );
            }

            return true;
        }),

    // 5. Stock must be a non-negative integer
    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),

    // 6. Category ID must be valid
    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .bail()
        .isMongoId()
        .withMessage("Category must be a valid MongoDB ID"),

    // 7. SKU is required
    body("sku")
        .trim()
        .notEmpty()
        .withMessage("SKU is required"),

    // Return validation errors
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array().map((error) => ({
                    field: error.path,
                    message: error.msg
                }))
            });
        }

        next();
    }
];

module.exports = validateProduct;
