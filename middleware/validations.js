// Basic validation helpers
const isEmpty = (value) => 
    value === undefined || 
    value === null || 
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

// Transaction validation middleware
const validateTransaction = (req, res, next) => {
    const errors = {};
    
    // Required fields for a transaction
    if (isEmpty(req.body.amount)) {
        errors.amount = 'Amount is required';
    } else if (isNaN(req.body.amount) || req.body.amount <= 0) {
        errors.amount = 'Amount must be a positive number';
    }

    if (isEmpty(req.body.currency)) {
        errors.currency = 'Currency is required';
    }

    if (isEmpty(req.body.paymentMethod)) {
        errors.paymentMethod = 'Payment method is required';
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            errors: errors 
        });
    }

    next();
};

// Enrollment validation middleware
const validateEnrollment = (req, res, next) => {
    const errors = {};
    const courseId = req.params.courseId;
    
    // Validate course ID
    if (!courseId) {
        errors.courseId = 'Course ID is required';
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            errors: errors 
        });
    }

    next();
};

// File validation middleware
const validateFile = (req, res, next) => {
    const errors = {};

    // Check if file exists
    if (!req.file && !req.files) {
        errors.file = 'File is required';
    }

    // Validate file size
    if (req.file && req.file.size > 100 * 1024 * 1024) { // 100MB limit
        errors.file = 'File size exceeds limit (100MB)';
    }

    if (req.files) {
        req.files.forEach((file, index) => {
            if (file.size > 100 * 1024 * 1024) {
                errors[`file${index}`] = `File ${file.originalname} exceeds size limit (100MB)`;
            }
        });
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            errors: errors 
        });
    }

    next();
};

// Schedule validation middleware
const validateSchedule = (req, res, next) => {
    const errors = {};

    // Required fields for schedule
    if (isEmpty(req.body.startTime)) {
        errors.startTime = 'Start time is required';
    }

    if (isEmpty(req.body.endTime)) {
        errors.endTime = 'End time is required';
    }

    if (isEmpty(req.body.title)) {
        errors.title = 'Title is required';
    }

    if (req.body.startTime && req.body.endTime) {
        const start = new Date(req.body.startTime);
        const end = new Date(req.body.endTime);
        if (end <= start) {
            errors.timeRange = 'End time must be after start time';
        }
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            errors: errors 
        });
    }

    next();
};

// Notification validation middleware
const validateNotification = (req, res, next) => {
    const errors = {};

    // Required fields for notification
    if (isEmpty(req.body.title)) {
        errors.title = 'Title is required';
    }

    if (isEmpty(req.body.message)) {
        errors.message = 'Message is required';
    }

    if (isEmpty(req.body.type)) {
        errors.type = 'Type is required';
    }

    // If sending to multiple users, validate userIds array
    if (req.body.userIds) {
        if (!Array.isArray(req.body.userIds) || req.body.userIds.length === 0) {
            errors.userIds = 'UserIds must be a non-empty array';
        }
    } else if (isEmpty(req.body.userId)) {
        // If not sending to multiple users, userId is required
        errors.userId = 'UserId is required';
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            errors: errors 
        });
    }

    next();
};

// Progress validation middleware
const validateProgress = (req, res, next) => {
    const errors = {};

    // Validate status if provided
    if (req.body.status && !['not-started', 'in-progress', 'completed'].includes(req.body.status)) {
        errors.status = 'Status must be one of: not-started, in-progress, completed';
    }

    // Validate timeSpent if provided
    if (req.body.timeSpent !== undefined) {
        if (isNaN(req.body.timeSpent) || req.body.timeSpent < 0) {
            errors.timeSpent = 'Time spent must be a non-negative number';
        }
    }

    // Validate score if provided
    if (req.body.score !== undefined) {
        if (isNaN(req.body.score) || req.body.score < 0 || req.body.score > 100) {
            errors.score = 'Score must be a number between 0 and 100';
        }
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            errors: errors 
        });
    }

    next();
};

module.exports = {
    validateTransaction,
    validateEnrollment,
    validateFile,
    validateSchedule,
    validateNotification,
    validateProgress,
    // Export other validation middlewares as needed
};