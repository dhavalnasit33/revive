
const { body, validationResult } = require("express-validator");

const validateCategory = [
    // Category name is required
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required"),

    // Slug is required
    body("slug")
        .trim()
        .notEmpty()
        .withMessage("Category slug is required")
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage(
            "Slug must contain lowercase letters, numbers, and hyphens only"
        ),

    // Description must be text
    body("description")
        .optional()
        .isString()
        .withMessage("Description must be text"),

    // Status must be active or inactive
    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be active or inactive"),

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

module.exports = validateCategory;
