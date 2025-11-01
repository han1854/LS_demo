const rateLimit = require('express-rate-limit');

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // limit mỗi IP
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // 10 uploads mỗi giờ
});

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 searches mỗi 15 phút
});

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 comments mỗi 15 phút
});

const rateLimiter = type => {
  switch (type) {
    case 'strict':
      return strictLimiter;
    case 'upload':
      return uploadLimiter;
    case 'search':
      return searchLimiter;
    case 'comment':
      return commentLimiter;
    default:
      return defaultLimiter;
  }
};

module.exports = rateLimiter;
