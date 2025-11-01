const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Quiz Access Routes
router.get('/:id', authMiddleware, quizController.findOne);
router.get('/lesson/:lessonId', authMiddleware, quizController.getQuizzesByLesson);
router.post('/:id/start', authMiddleware, quizController.startQuiz);
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);

// Quiz Results
router.get('/:id/results', authMiddleware, quizController.getQuizResults);
router.get('/results/:resultId', authMiddleware, quizController.getQuizResult);
router.get('/my/results', authMiddleware, quizController.getMyResults);

// Instructor Quiz Management
router.post('/', authMiddleware, checkRole(['instructor']), quizController.create);
router.put('/:id', authMiddleware, checkRole(['instructor']), quizController.update);
router.delete('/:id', authMiddleware, checkRole(['instructor']), quizController.delete);
router.put('/:id/publish', authMiddleware, checkRole(['instructor']), quizController.publish);
router.put(
  '/:id/questions/reorder',
  authMiddleware,
  checkRole(['instructor']),
  quizController.reorderQuestions,
);

// Question Management
router.post(
  '/:id/questions',
  authMiddleware,
  checkRole(['instructor']),
  quizController.addQuestion,
);
router.put(
  '/:id/questions/:questionId',
  authMiddleware,
  checkRole(['instructor']),
  quizController.updateQuestion,
);
router.delete(
  '/:id/questions/:questionId',
  authMiddleware,
  checkRole(['instructor']),
  quizController.deleteQuestion,
);

// Quiz Statistics (Instructor)
router.get('/:id/stats', authMiddleware, checkRole(['instructor']), quizController.getQuizStats);
router.get(
  '/:id/attempts',
  authMiddleware,
  checkRole(['instructor']),
  quizController.getQuizAttempts,
);

module.exports = router;
