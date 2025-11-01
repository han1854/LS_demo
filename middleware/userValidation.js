const { body, query, validationResult } = require('express-validator');
const xss = require('xss-clean');
const hpp = require('hpp');

// XSS Protection Middleware
const xssProtection = xss();

// HTTP Parameter Pollution Protection
const hppProtection = hpp();

// Validation rules cho đăng ký user
// For registration we only require Username and Password; other fields are optional
const validateUser = [
  body('Username')
    .trim()
    .notEmpty()
    .withMessage('Tên đăng nhập không được để trống')
    .isLength({ min: 3, max: 50 })
    .withMessage('Tên đăng nhập phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),

  body('Password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'),

  // Optional fields - validate if provided
  body('Email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .toLowerCase()
    .custom(value => {
      const blacklistedDomains = ['tempmail.com', 'guerrillamail.com', 'throwawaymail.com'];
      const domain = value.split('@')[1];
      if (blacklistedDomains.includes(domain)) {
        throw new Error('Domain email không được chấp nhận');
      }
      return true;
    }),

  body('FirstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Họ phải có ít nhất 2 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Họ chỉ được chứa chữ cái và khoảng trắng'),

  body('LastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Tên phải có ít nhất 2 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),

  body('PhoneNumber')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),

  body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Role không hợp lệ'),

  handleValidationErrors,
];

// Validation rules cho đăng nhập - allow Username or Email
const validateLogin = [
  body('Password').notEmpty().withMessage('Mật khẩu không được để trống'),
  // Ensure at least one identifier is provided
  (req, res, next) => {
    if (!req.body.Username && !req.body.Email) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không hợp lệ',
        errors: [
          { field: 'Username', message: 'Username or Email is required' },
        ],
      });
    }
    next();
  },
  handleValidationErrors,
];

// Validation rules cho đổi mật khẩu
const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),

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

  handleValidationErrors,
];

// Validation rules cho cập nhật profile - accept both camelCase and PascalCase
const profileNameRules = [
  body('FirstName').optional().trim().isLength({ min: 2 }).withMessage('Họ phải có ít nhất 2 ký tự').matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Họ chỉ được chứa chữ cái và khoảng trắng'),
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Họ phải có ít nhất 2 ký tự').matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Họ chỉ được chứa chữ cái và khoảng trắng'),
  body('LastName').optional().trim().isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự').matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự').matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),
];

const profileContactRules = [
  body('PhoneNumber').optional().matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  body('phone').optional().matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  body('Address').optional().trim().isLength({ min: 5 }).withMessage('Địa chỉ phải có ít nhất 5 ký tự'),
  body('address').optional().trim().isLength({ min: 5 }).withMessage('Địa chỉ phải có ít nhất 5 ký tự'),
];

const validateProfileUpdate = [
  ...profileNameRules,
  ...profileContactRules,
  handleValidationErrors,
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
        message: err.msg,
      })),
    });
  }
  next();
}

// Query validation middleware
const validateQueryParams = [
  query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải là số nguyên từ 1 đến 100'),

  query('sort').optional().isIn(['asc', 'desc']).withMessage('Sort phải là "asc" hoặc "desc"'),

  handleValidationErrors,
];

module.exports = {
  validateUser,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateQueryParams,
  xssProtection,
  hppProtection,
};
