const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller.compat');
const { authMiddleware, checkRole } = require('../middleware/auth');

const { validateProgress } = require('../middleware/validations');

// Student Progress Tracking
router.get('/my/courses', authMiddleware, progressController.getMyCoursesProgress);

router.get('/my/course/:courseId', authMiddleware, progressController.getMyCourseProgress);

router.get('/my/lesson/:lessonId', authMiddleware, progressController.getMyLessonProgress);

router.post(
  '/my/lesson/:lessonId/complete',
  authMiddleware,
  validateProgress,
  progressController.markLessonComplete,
);

router.post(
  '/my/lesson/:lessonId/time',
  authMiddleware,
  validateProgress,
  progressController.updateLearningTime,
);

// Course Progress Management
router.get(
  '/course/:courseId/overview',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getCourseProgressOverview,
);
router.get(
  '/course/:courseId/students',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getCourseStudentsProgress,
);
router.get(
  '/course/:courseId/completion-rate',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getCourseCompletionRate,
);

// Lesson Progress Analytics
router.get(
  '/lesson/:lessonId/overview',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getLessonProgressOverview,
);
router.get(
  '/lesson/:lessonId/time-spent',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getLessonTimeSpent,
);
router.get(
  '/lesson/:lessonId/completion-rate',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getLessonCompletionRate,
);

// Student Progress Details
router.get(
  '/student/:userId/courses',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  progressController.getStudentCoursesProgress,
);
router.get(
  '/student/:userId/course/:courseId',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  progressController.getStudentCourseProgress,
);
router.get(
  '/student/:userId/learning-path',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  progressController.getStudentLearningPath,
);

// Progress Reports
router.get(
  '/reports/course/:courseId',
  authMiddleware,
  checkRole(['instructor']),
  progressController.generateCourseReport,
);
router.get(
  '/reports/student/:userId',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  progressController.generateStudentReport,
);
router.get(
  '/reports/overview',
  authMiddleware,
  checkRole(['admin']),
  progressController.generatePlatformReport,
);

// Analytics Dashboard Data
router.get(
  '/analytics/platform',
  authMiddleware,
  checkRole(['admin']),
  progressController.getPlatformAnalytics,
);
router.get(
  '/analytics/instructor',
  authMiddleware,
  checkRole(['instructor']),
  progressController.getInstructorAnalytics,
);
router.get(
  '/analytics/trends',
  authMiddleware,
  checkRole(['admin']),
  progressController.getLearningTrends,
);

// Milestones and Achievements
router.get('/my/achievements', authMiddleware, progressController.getMyAchievements);
router.get('/my/certificates', authMiddleware, progressController.getMyCertificates);
router.get('/my/learning-goals', authMiddleware, progressController.getMyLearningGoals);

module.exports = router;
