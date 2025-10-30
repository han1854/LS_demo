const router = require('express').Router();
const userController = require('../controllers/user.controller.compat');
const { validateUser } = require('../middleware/userValidation');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public Authentication Routes
router.post('/register', validateUser, userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', userController.logout);

// Password Management
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.put('/change-password', authMiddleware, userController.changePassword);

// Email Verification
router.post('/verify-email/:token', userController.verifyEmail);
router.post('/resend-verification', authMiddleware, userController.resendVerification);

// User Profile Management
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', 
    authMiddleware, 
    validateUser, 
    userController.updateProfile
);
router.post('/profile/avatar', 
    authMiddleware, 
    userController.uploadAvatar
);
router.delete('/profile/avatar', 
    authMiddleware, 
    userController.deleteAvatar
);

// User Learning
router.get('/my/courses', 
    authMiddleware, 
    userController.getMyCourses
);
router.get('/my/progress', 
    authMiddleware, 
    userController.getMyProgress
);
router.get('/my/certificates', 
    authMiddleware, 
    userController.getMyCertificates
);
router.get('/my/assignments', 
    authMiddleware, 
    userController.getMyAssignments
);

// User Preferences & Settings
router.get('/preferences', 
    authMiddleware, 
    userController.getPreferences
);
router.put('/preferences', 
    authMiddleware, 
    userController.updatePreferences
);
router.put('/notifications/settings', 
    authMiddleware, 
    userController.updateNotificationSettings
);

// Instructor Management
router.get('/instructors', userController.getInstructors);
router.get('/instructors/:id/profile', userController.getInstructorProfile);
router.get('/instructors/:id/courses', userController.getInstructorCourses);
router.get('/instructors/:id/reviews', userController.getInstructorReviews);
router.post('/become-instructor', 
    authMiddleware, 
    userController.applyForInstructor
);

// Admin User Management
router.get('/', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.findAll
);
router.get('/:id', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.findOne
);
router.put('/:id', 
    authMiddleware, 
    checkRole(['admin']), 
    validateUser, 
    userController.update
);
router.delete('/:id', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.delete
);

// User Status Management (Admin)
router.put('/:id/status', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.updateStatus
);
router.put('/:id/role', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.updateRole
);
router.put('/:id/verify', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.verifyUser
);

// User Analytics (Admin)
router.get('/analytics/overview', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.getUserAnalytics
);
router.get('/analytics/engagement', 
    authMiddleware, 
    checkRole(['admin']), 
    userController.getUserEngagement
);

module.exports = router;
