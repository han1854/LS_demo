const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller.compat.js");
const { authMiddleware, checkRole } = require('../middleware/auth');

// Lesson Access (Students)
router.get("/course/:courseId", authMiddleware, lessonController.getCourseLessons);
router.get("/:id", authMiddleware, lessonController.findOne);
router.get("/:id/content", authMiddleware, lessonController.getLessonContent);
router.post("/:id/complete", authMiddleware, lessonController.markAsComplete);
router.get("/my/progress", authMiddleware, lessonController.getMyProgress);
router.get("/my/bookmarks", authMiddleware, lessonController.getMyBookmarks);

// Lesson Management (Instructor)
router.post("/", authMiddleware, checkRole(['instructor']), lessonController.create);
router.put("/:id", authMiddleware, checkRole(['instructor']), lessonController.update);
router.delete("/:id", authMiddleware, checkRole(['instructor']), lessonController.delete);
router.put("/:id/publish", authMiddleware, checkRole(['instructor']), lessonController.publish);
router.put("/:id/unpublish", authMiddleware, checkRole(['instructor']), lessonController.unpublish);

// Lesson Content Management
router.post("/:id/resources", authMiddleware, checkRole(['instructor']), lessonController.addResource);
router.delete("/:id/resources/:resourceId", authMiddleware, checkRole(['instructor']), lessonController.deleteResource);
router.put("/:id/order", authMiddleware, checkRole(['instructor']), lessonController.updateOrder);

// Student Interactions
router.post("/:id/bookmark", authMiddleware, lessonController.bookmarkLesson);
router.delete("/:id/bookmark", authMiddleware, lessonController.removeBookmark);
router.post("/:id/notes", authMiddleware, lessonController.addNote);
router.get("/:id/notes", authMiddleware, lessonController.getNotes);
router.put("/:id/notes/:noteId", authMiddleware, lessonController.updateNote);
router.delete("/:id/notes/:noteId", authMiddleware, lessonController.deleteNote);

// Progress Tracking
router.get("/:id/progress", authMiddleware, checkRole(['instructor']), lessonController.getLessonProgress);
router.get("/:id/completion-stats", authMiddleware, checkRole(['instructor']), lessonController.getCompletionStats);

// Content Preview (Instructor)
router.get("/:id/preview", authMiddleware, checkRole(['instructor']), lessonController.previewLesson);
router.post("/:id/preview", authMiddleware, checkRole(['instructor']), lessonController.generatePreview);

// Analytics (Admin/Instructor)
router.get("/analytics/engagement", authMiddleware, checkRole(['admin', 'instructor']), lessonController.getEngagementAnalytics);
router.get("/analytics/time-spent", authMiddleware, checkRole(['admin', 'instructor']), lessonController.getTimeSpentAnalytics);

module.exports = router;
