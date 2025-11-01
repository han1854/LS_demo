const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { validateSchedule } = require('../middleware/validations');

// Schedule Creation
router.post(
  '/',
  authMiddleware,
  checkRole(['instructor']),
  validateSchedule,
  scheduleController.createSchedule,
);

router.post(
  '/recurring',
  authMiddleware,
  checkRole(['instructor']),
  validateSchedule,
  scheduleController.createRecurringSchedule,
);

// Schedule Management
router.put(
  '/:id',
  authMiddleware,
  checkRole(['instructor']),
  validateSchedule,
  scheduleController.updateSchedule,
);

router.delete('/:id', authMiddleware, checkRole(['instructor']), scheduleController.deleteSchedule);

// Schedule Status Management
router.put(
  '/:id/cancel',
  authMiddleware,
  checkRole(['instructor']),
  scheduleController.cancelSchedule,
);

router.put(
  '/:id/reschedule',
  authMiddleware,
  checkRole(['instructor']),
  scheduleController.rescheduleSession,
);

router.put(
  '/:id/complete',
  authMiddleware,
  checkRole(['instructor']),
  scheduleController.markSessionComplete,
);

// Schedule Retrieval
router.get('/my', authMiddleware, scheduleController.getMySchedule);

router.get('/course/:courseId', authMiddleware, scheduleController.getCourseSchedule);

router.get('/instructor/:instructorId', authMiddleware, scheduleController.getInstructorSchedule);

// Schedule Search & Filter
router.get('/search', authMiddleware, scheduleController.searchSchedules);

router.get('/available-slots', authMiddleware, scheduleController.getAvailableSlots);

// Attendance Management
router.post(
  '/:id/attendance',
  authMiddleware,
  checkRole(['instructor']),
  scheduleController.recordAttendance,
);

router.get('/:id/attendance', authMiddleware, scheduleController.getSessionAttendance);

router.put(
  '/:id/attendance/:studentId',
  authMiddleware,
  checkRole(['instructor']),
  scheduleController.updateAttendance,
);

// Notifications & Reminders
router.post('/:id/reminder', authMiddleware, scheduleController.setSessionReminder);

router.post(
  '/batch/reminder',
  authMiddleware,
  checkRole(['instructor']),
  scheduleController.setBatchReminders,
);

// Schedule Analytics
router.get(
  '/analytics/overview',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  scheduleController.getScheduleAnalytics,
);

router.get(
  '/analytics/attendance',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  scheduleController.getAttendanceAnalytics,
);

// Calendar Integration
router.post('/sync/calendar', authMiddleware, scheduleController.syncWithCalendar);

router.get('/export/calendar', authMiddleware, scheduleController.exportToCalendar);

module.exports = router;
