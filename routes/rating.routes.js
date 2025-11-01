const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Course Rating Management
router.post('/course/:courseId', authMiddleware, ratingController.create);
router.put('/course/:courseId', authMiddleware, ratingController.update);
router.delete('/course/:courseId', authMiddleware, ratingController.delete);

// Rating Retrieval
router.get('/course/:courseId', ratingController.getByCourse);
router.get('/course/:courseId/summary', ratingController.getCourseSummary);
router.get('/my/ratings', authMiddleware, ratingController.getMyRatings);

// Rating Responses
router.post(
  '/:id/reply',
  authMiddleware,
  checkRole(['instructor']),
  ratingController.replyToRating,
);
router.put('/:id/reply', authMiddleware, checkRole(['instructor']), ratingController.updateReply);
router.delete(
  '/:id/reply',
  authMiddleware,
  checkRole(['instructor']),
  ratingController.deleteReply,
);

// Rating Moderation (Admin)
router.put('/:id/moderate', authMiddleware, checkRole(['admin']), ratingController.moderateRating);
router.delete('/:id/moderate', authMiddleware, checkRole(['admin']), ratingController.deleteRating);

// Rating Reports
router.post('/:id/report', authMiddleware, ratingController.reportRating);
router.get('/reports', authMiddleware, checkRole(['admin']), ratingController.getRatingReports);
router.put(
  '/reports/:reportId',
  authMiddleware,
  checkRole(['admin']),
  ratingController.handleReport,
);

// Rating Analytics
router.get(
  '/course/:courseId/analytics',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  ratingController.getCourseRatingAnalytics,
);
router.get(
  '/instructor/:instructorId/analytics',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  ratingController.getInstructorRatingAnalytics,
);

// Rating Filters
router.get('/course/:courseId/filter', ratingController.filterRatings);

// Helpful Votes
router.post('/:id/helpful', authMiddleware, ratingController.markAsHelpful);
router.delete('/:id/helpful', authMiddleware, ratingController.removeHelpfulMark);

module.exports = router;
