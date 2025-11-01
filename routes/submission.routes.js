const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Student Submission Management
router.post('/assignment/:assignmentId', authMiddleware, submissionController.create);

router.put('/:id', authMiddleware, submissionController.update);

router.delete('/:id', authMiddleware, submissionController.delete);

// Student Submission Access
router.get('/my/submissions', authMiddleware, submissionController.getMySubmissions);

router.get('/my/grades', authMiddleware, submissionController.getMyGrades);

// Instructor Access
router.get(
  '/course/:courseId',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.getCourseSubmissions,
);

router.get(
  '/assignment/:assignmentId',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.getAssignmentSubmissions,
);

router.get(
  '/student/:studentId',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.getStudentSubmissions,
);

// Individual Submission Access
router.get('/:id', authMiddleware, submissionController.findOne);

// Instructor Grading
router.put(
  '/:id/grade',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.gradeSubmission,
);

router.put(
  '/:id/feedback',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.provideFeedback,
);

// Bulk Operations (Instructor)
router.post(
  '/bulk/grade',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.bulkGradeSubmissions,
);

// Statistics and Reports
router.get(
  '/assignment/:assignmentId/stats',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.getSubmissionStats,
);

// Late Submission Handling
router.post(
  '/assignment/:assignmentId/request-extension',
  authMiddleware,
  submissionController.requestExtension,
);

router.put(
  '/extension/:requestId',
  authMiddleware,
  checkRole(['instructor']),
  submissionController.handleExtensionRequest,
);

module.exports = router;
