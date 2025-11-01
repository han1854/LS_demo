const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.post(
  '/course/:courseId',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  announcementController.create,
);
router.get('/course/:courseId', authMiddleware, announcementController.getCourseAnnouncements);
router.get('/my', authMiddleware, announcementController.getMyAnnouncements);
router.put(
  '/:id',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  announcementController.update,
);
router.delete(
  '/:id',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  announcementController.delete,
);
router.put(
  '/:id/publish',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  announcementController.publish,
);
router.get(
  '/:id/recipients',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  announcementController.getRecipients,
);

module.exports = router;
