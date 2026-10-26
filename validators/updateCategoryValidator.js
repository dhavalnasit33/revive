
const { body, validationResult } = require("express-validator");

const validateCategoryUpdate = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category name cannot be empty"),

    body("slug")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category slug cannot be empty")
        .bail()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage("Invalid category slug format"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be text"),

    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be active or inactive"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg
                }))
            });
        }

        next();
    }
];

module.exports = validateCategoryUpdate;
