
const { body, validationResult } = require("express-validator");

const validateProductUpdate = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Product name cannot be empty"),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty"),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be zero or greater"),

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

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),

    body("category")
        .optional()
        .isMongoId()
        .withMessage("Category must be a valid MongoDB ID"),

    body("sku")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("SKU cannot be empty"),

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

module.exports = validateProductUpdate;
