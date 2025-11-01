const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller.compat');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public Course Access
router.get('/', courseController.findAll); // List all courses with filters
router.get('/:id', courseController.findOne); // Get course details

// Course Creation & Management (Instructor/Admin only)
router.post('/', authMiddleware, checkRole(['instructor', 'admin']), courseController.create);

router.put('/:id', authMiddleware, checkRole(['instructor', 'admin']), courseController.update);

router.delete('/:id', authMiddleware, checkRole(['instructor', 'admin']), courseController.delete);

// Course Status Management
router.put(
  '/:id/publish',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  courseController.publish,
);

router.put(
  '/:id/archive',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  courseController.archive,
);

// Course Content Management
router.post(
  '/:id/lessons',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  courseController.addLesson,
);

router.put(
  '/:id/lessons/reorder',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  courseController.reorderLessons,
);

// Course Analytics & Reports
router.get(
  '/:id/analytics',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  courseController.getCourseAnalytics,
);

router.get(
  '/:id/progress',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  courseController.getCourseProgress,
);

// Student Course Access
router.get('/my/enrolled', authMiddleware, courseController.getEnrolledCourses);

router.get('/my/completed', authMiddleware, courseController.getCompletedCourses);

router.get('/:id/syllabus', authMiddleware, courseController.getCourseSyllabus);

// Course Reviews & Ratings
router.get('/:id/reviews', courseController.getCourseReviews);

router.post('/:id/reviews', authMiddleware, courseController.addCourseReview);

module.exports = router;
