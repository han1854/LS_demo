const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xssClean = require('xss-clean');

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Tăng giới hạn lên 1000 request mỗi 15 phút
  message: 'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Tăng giới hạn lên 500 request mỗi 15 phút
  message: 'Quá nhiều request API từ IP này',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiting (ngăn chặn brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // 5 lần thử trong 1 giờ
  message: 'Quá nhiều lần thử đăng nhập thất bại, vui lòng thử lại sau 1 giờ',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204,
};

// Middleware function to check for valid auth token format
const validateTokenFormat = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // Kiểm tra định dạng token cơ bản
    if (token && token.length >= 32 && token.length <= 512) {
      next();
    } else {
      res.status(401).json({ message: 'Invalid token format' });
    }
  } else if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    next(); // Bỏ qua kiểm tra cho route đăng nhập/đăng ký
  } else {
    res.status(401).json({ message: 'Authorization header required' });
  }
};

// Allow unauthenticated GET requests but require auth for non-GET methods
const requireAuthUnlessGet = (req, res, next) => {
  if (req.method === 'GET') return next();
  // For non-GET requests, reuse validateTokenFormat logic
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token.length >= 32 && token.length <= 512) {
      return next();
    }
    return res.status(401).json({ message: 'Invalid token format' });
  }
  return res.status(401).json({ message: 'Authorization header required' });
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Thêm các security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  // Strict Transport Security
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  // Feature Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=()',
  );

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Clear Site Data on Logout (add to your logout route)
  if (req.path === '/api/auth/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }
  next();
};

// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
  const sanitizeValue = value => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/\b(alert|confirm|prompt|exec|eval|function|toString)\b/gi, '')
      .trim();
  };

  const sanitizeObject = obj => {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = sanitizeObject(obj[key]);
      } else {
        obj[key] = sanitizeValue(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize Query Params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL Params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = {
  limiter,
  apiLimiter,
  authLimiter,
  helmetConfig,
  corsOptions,
  validateTokenFormat,
  requireAuthUnlessGet,
  securityHeaders,
  sanitizeRequest,
  // Middleware tổng hợp cho các route API
  apiSecurity: [
    helmetConfig,
    sanitizeRequest, // Custom request sanitization
    securityHeaders, // Custom security headers
    // Đã loại bỏ hpp() và xssClean() vì đã có sanitizeRequest
  ],
};
