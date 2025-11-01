const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller.compat');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { validateNotification } = require('../middleware/validations');

// User Notification Management
router.get('/user/:userId', authMiddleware, notificationController.getUserNotifications);

router.get('/count/:userId', authMiddleware, notificationController.getNotificationCount);

// Individual Notification Actions
router.post(
  '/',
  authMiddleware,
  checkRole(['admin', 'instructor']),
  validateNotification,
  notificationController.createNotification,
);

router.put('/:id/read', authMiddleware, notificationController.markNotificationRead);

router.put('/read-all/:userId', authMiddleware, notificationController.markAllNotificationsRead);

router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// Notification Preferences
router.put('/preferences', authMiddleware, notificationController.updateNotificationPreferences);

router.get('/preferences', authMiddleware, notificationController.getNotificationPreferences);

// Notification Subscriptions
router.post('/subscribe', authMiddleware, notificationController.subscribeToNotifications);

router.post('/unsubscribe', authMiddleware, notificationController.unsubscribeFromNotifications);

module.exports = router;
