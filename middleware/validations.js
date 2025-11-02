// Validation helpers
const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);

const isValidDate = date => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = phone => {
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
};

const isValidURL = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sanitizeHTML = str => {
  return str.replace(/<[^>]*>/g, '');
};

// Validation middlewares
const validateCategory = async (req, res, next) => {
  const errors = {};

  // Accept both PascalCase and camelCase
  const name = (req.body.Name || req.body.name || '').trim();
  const parentId = req.body.ParentID || req.body.parentId;
  const status = req.body.Status || req.body.status;

  if (!name) {
    errors.name = 'Tên danh mục không được để trống';
  } else if (name.length < 2) {
    errors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
  }

  if (parentId !== undefined && parentId !== null) {
    const pid = parseInt(parentId, 10);
    if (isNaN(pid) || pid <= 0) {
      errors.parentId = 'ID danh mục cha không hợp lệ';
    } else {
      try {
        const Category = require('../models').Category;
        const parentExists = await Category.findByPk(pid);
        if (!parentExists) {
          errors.parentId = 'Danh mục cha không tồn tại';
        }
      } catch (error) {
        console.error('Error checking parent category:', error);
      }
    }
  }

  if (status !== undefined && !['active', 'inactive'].includes(status)) {
    errors.status = 'Trạng thái không hợp lệ';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Dữ liệu không hợp lệ',
      errors 
    });
  }

  // Store normalized data for the controller
  req.validatedData = {
    Name: name,
    ParentID: parentId,
    Status: status || 'active'
  };

  next();
};

const validateEnrollment = (req, res, next) => {
  const errors = {};
  const courseId = req.params.courseId || req.body.courseId || req.query.courseId;
  if (!courseId) {
    errors.courseId = 'Course ID is required';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateFile = (req, res, next) => {
  const errors = {};
  if (!req.file && !req.files) {
    errors.file = 'File is required';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateSchedule = (req, res, next) => {
  const errors = {};
  if (isEmpty(req.body.StartTime)) errors.startTime = 'Start time is required';
  if (isEmpty(req.body.EndTime)) errors.endTime = 'End time is required';
  if (!isEmpty(req.body.StartTime) && !isEmpty(req.body.EndTime)) {
    const start = new Date(req.body.StartTime);
    const end = new Date(req.body.EndTime);
    if (end <= start) errors.timeRange = 'End time must be after start time';
  }
  if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors });
  next();
};

const validateNotification = (req, res, next) => {
  const errors = {};
  if (isEmpty(req.body.Title)) errors.title = 'Title is required';
  if (isEmpty(req.body.Message)) errors.message = 'Message is required';
  if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors });
  next();
};

const validateProgress = (req, res, next) => {
  const errors = {};
  if (req.body.Status && !['not-started', 'in-progress', 'completed'].includes(req.body.Status)) {
    errors.Status = 'Invalid status';
  }
  if (req.body.TimeSpent !== undefined && (isNaN(req.body.TimeSpent) || req.body.TimeSpent < 0)) {
    errors.TimeSpent = 'TimeSpent must be a non-negative number';
  }
  if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors });
  next();
};

const validateTransaction = (req, res, next) => {
  const errors = {};
  if (isEmpty(req.body.Amount)) errors.amount = 'Amount is required';
  if (isNaN(req.body.Amount) || req.body.Amount <= 0)
    errors.amount = 'Amount must be a positive number';
  if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors });
  next();
};

const validateCourse = (req, res, next) => {
  const errors = {};

  if (isEmpty(req.body.Title)) {
    errors.Title = 'Course title is required';
  } else if (req.body.Title.length < 5) {
    errors.Title = 'Course title must be at least 5 characters long';
  }

  if (isEmpty(req.body.Description)) {
    errors.Description = 'Course description is required';
  }

  if (req.body.Price !== undefined) {
    const price = parseFloat(req.body.Price);
    if (isNaN(price) || price < 0) {
      errors.Price = 'Price must be a non-negative number';
    }
  }

  if (req.body.CategoryID) {
    const catId = parseInt(req.body.CategoryID);
    if (isNaN(catId) || catId <= 0) {
      errors.CategoryID = 'Invalid category ID';
    }
  }

  if (req.body.ThumbnailURL && !isValidURL(req.body.ThumbnailURL)) {
    errors.ThumbnailURL = 'Invalid thumbnail URL';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateLesson = (req, res, next) => {
  const errors = {};

  if (isEmpty(req.body.Title)) {
    errors.Title = 'Lesson title is required';
  }

  if (req.body.Duration) {
    const duration = parseInt(req.body.Duration);
    if (isNaN(duration) || duration <= 0) {
      errors.Duration = 'Duration must be a positive number';
    }
  }

  if (req.body.Order) {
    const order = parseInt(req.body.Order);
    if (isNaN(order) || order < 0) {
      errors.Order = 'Order must be a non-negative number';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateQuiz = (req, res, next) => {
  const errors = {};

  if (isEmpty(req.body.Title)) {
    errors.Title = 'Quiz title is required';
  }

  if (req.body.Duration) {
    const duration = parseInt(req.body.Duration);
    if (isNaN(duration) || duration <= 0) {
      errors.Duration = 'Duration must be a positive number';
    }
  }

  if (req.body.PassingScore) {
    const score = parseFloat(req.body.PassingScore);
    if (isNaN(score) || score < 0 || score > 100) {
      errors.PassingScore = 'Passing score must be between 0 and 100';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateComment = (req, res, next) => {
  const errors = {};

  if (isEmpty(req.body.Content)) {
    errors.Content = 'Comment content is required';
  } else {
    // Sanitize HTML to prevent XSS
    req.body.Content = sanitizeHTML(req.body.Content);
  }

  if (req.body.ParentID) {
    const parentId = parseInt(req.body.ParentID);
    if (isNaN(parentId) || parentId <= 0) {
      errors.ParentID = 'Invalid parent comment ID';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateRating = (req, res, next) => {
  const errors = {};

  const rating = parseInt(req.body.Rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errors.Rating = 'Rating must be between 1 and 5';
  }

  if (req.body.Review) {
    req.body.Review = sanitizeHTML(req.body.Review);
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateUser = (req, res, next) => {
  const errors = {};

  if (req.body.Email && !isValidEmail(req.body.Email)) {
    errors.Email = 'Invalid email format';
  }

  if (req.body.Phone && !isValidPhone(req.body.Phone)) {
    errors.Phone = 'Invalid phone number format';
  }

  if (req.body.Password && req.body.Password.length < 8) {
    errors.Password = 'Password must be at least 8 characters long';
  }

  if (req.body.Avatar && !isValidURL(req.body.Avatar)) {
    errors.Avatar = 'Invalid avatar URL';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

module.exports = {
  validateCategory,
  validateCourse,
  validateLesson,
  validateQuiz,
  validateComment,
  validateRating,
  validateUser,
  validateEnrollment,
  validateFile,
  validateSchedule,
  validateNotification,
  validateProgress,
  validateTransaction,
};
