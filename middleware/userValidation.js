const { body, query, validationResult } = require('express-validator');
const xss = require('xss-clean');
const hpp = require('hpp');

// XSS Protection Middleware
const xssProtection = xss();

// HTTP Parameter Pollution Protection
const hppProtection = hpp();

// Validation rules cho đăng ký user
const validateUser = [
    body('FullName')
        .trim()
        .notEmpty()
        .withMessage('Họ tên không được để trống')
        .isLength({ min: 2 })
        .withMessage('Họ tên phải có ít nhất 2 ký tự')
        .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
        .withMessage('Họ tên chỉ được chứa chữ cái và khoảng trắng'),
    
    body('Email')
        .trim()
        .notEmpty()
        .withMessage('Email không được để trống')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
        .toLowerCase()
        .custom(value => {
            // Thêm kiểm tra blacklist domain nếu cần
            const blacklistedDomains = ['tempmail.com', 'guerrillamail.com', 'throwawaymail.com'];
            const domain = value.split('@')[1];
            if (blacklistedDomains.includes(domain)) {
                throw new Error('Domain email không được chấp nhận');
            }
            return true;
        }),
    
    body('Password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'),
    
    body('role')
        .optional()
        .isIn(['student', 'instructor', 'admin'])
        .withMessage('Role không hợp lệ'),

    handleValidationErrors
];

// Validation rules cho đăng nhập
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email không được để trống')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống'),
    
    handleValidationErrors
];

// Validation rules cho đổi mật khẩu
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại không được để trống'),
    
    body('newPassword')
        .notEmpty()
        .withMessage('Mật khẩu mới không được để trống')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
            }
            return true;
        }),
    
    body('confirmPassword')
        .notEmpty()
        .withMessage('Xác nhận mật khẩu không được để trống')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Xác nhận mật khẩu không khớp');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Validation rules cho cập nhật profile
const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Họ phải có ít nhất 2 ký tự')
        .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
        .withMessage('Họ chỉ được chứa chữ cái và khoảng trắng'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Tên phải có ít nhất 2 ký tự')
        .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
        .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),
    
    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ min: 5 })
        .withMessage('Địa chỉ phải có ít nhất 5 ký tự'),
    
    handleValidationErrors
];

// Middleware xử lý kết quả validation
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
}

// Query validation middleware
const validateQueryParams = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số trang phải là số nguyên dương'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit phải là số nguyên từ 1 đến 100'),
    
    query('sort')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort phải là "asc" hoặc "desc"'),
    
    handleValidationErrors
];

module.exports = {
    validateUser,
    validateLogin,
    validatePasswordChange,
    validateProfileUpdate,
    validateQueryParams,
    xssProtection,
    hppProtection
};