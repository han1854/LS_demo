const { body, validationResult } = require('express-validator');

const validateUser = [
    body('FullName')
        .notEmpty()
        .withMessage('Full name is required')
        .trim(),
    body('Email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .trim()
        .normalizeEmail(),
    body('Password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

module.exports = {
    validateUser
};