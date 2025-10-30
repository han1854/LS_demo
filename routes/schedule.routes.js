const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/schedule.controller");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Create schedule (teacher/admin only)
router.post("/", 
    authMiddleware, 
    checkRole(['teacher', 'admin']), 
    scheduleController.create
);

// Get course schedule
router.get("/course/:courseId", 
    authMiddleware, 
    scheduleController.getByCourse
);

// Get user schedule
router.get("/user/:userId", 
    authMiddleware, 
    scheduleController.getUserSchedule
);

// Update schedule (teacher/admin only)
router.put("/:id", 
    authMiddleware, 
    checkRole(['teacher', 'admin']), 
    scheduleController.update
);

// Cancel schedule (teacher/admin only)
router.put("/cancel/:id", 
    authMiddleware, 
    checkRole(['teacher', 'admin']), 
    scheduleController.cancel
);

module.exports = router;