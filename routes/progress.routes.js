const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progress.controller");
const { authMiddleware } = require("../middleware/auth");

// Update lesson progress
router.post("/:userId/:courseId/:lessonId", 
    authMiddleware, 
    progressController.updateProgress
);

// Get course progress
router.get("/course/:userId/:courseId", 
    authMiddleware, 
    progressController.getCourseProgress
);

// Get user progress for all courses
router.get("/user/:userId", 
    authMiddleware, 
    progressController.getUserProgress
);

// Get lesson statistics
router.get("/lesson/:lessonId", 
    authMiddleware, 
    progressController.getLessonStats
);

module.exports = router;