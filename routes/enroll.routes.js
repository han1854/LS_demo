const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { validateEnrollment } = require('../middleware/validations');

// Student Enrollment Actions
router.post(
  '/course/:courseId',
  authMiddleware,
  validateEnrollment,
  enrollmentController.enrollInCourse,
);

router.delete('/course/:courseId', authMiddleware, enrollmentController.unenrollFromCourse);

// Student Enrollment Status
router.get('/my/courses', authMiddleware, enrollmentController.getMyEnrollments);

router.get('/my/completed', authMiddleware, enrollmentController.getMyCompletedCourses);

router.get('/my/active', authMiddleware, enrollmentController.getMyActiveCourses);

// Course Enrollment Management (Instructor)
router.get(
  '/course/:courseId/students',
  authMiddleware,
  checkRole(['instructor']),
  enrollmentController.getCourseEnrollments,
);

router.get(
  '/course/:courseId/stats',
  authMiddleware,
  checkRole(['instructor']),
  enrollmentController.getCourseEnrollmentStats,
);

// Enrollment Status Management
router.put(
  '/:id/activate',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  enrollmentController.activateEnrollment,
);

router.put(
  '/:id/deactivate',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  enrollmentController.deactivateEnrollment,
);

// Batch Enrollment Management (Admin)
router.post('/batch', authMiddleware, checkRole(['admin']), enrollmentController.batchEnroll);

router.put(
  '/batch/status',
  authMiddleware,
  checkRole(['admin']),
  enrollmentController.batchUpdateStatus,
);

// Enrollment Analytics
router.get(
  '/analytics/overview',
  authMiddleware,
  checkRole(['admin']),
  enrollmentController.getEnrollmentAnalytics,
);

router.get(
  '/analytics/trends',
  authMiddleware,
  checkRole(['admin']),
  enrollmentController.getEnrollmentTrends,
);

// Enrollment History
router.get('/:id/history', authMiddleware, enrollmentController.getEnrollmentHistory);

// Enrollment Verification
router.get('/:id/verify', authMiddleware, enrollmentController.verifyEnrollment);

// Payment Status
router.get('/:id/payment', authMiddleware, enrollmentController.getEnrollmentPayment);

router.put(
  '/:id/payment',
  authMiddleware,
  checkRole(['admin']),
  enrollmentController.updatePaymentStatus,
);

module.exports = router;
