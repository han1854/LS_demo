const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller.compat.js");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Assignment Access (Students & Instructors)
router.get("/", authMiddleware, assignmentController.findAll);
router.get("/:id", authMiddleware, assignmentController.findOne);

// Assignment Management (Instructor Only)
router.post("/", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.create
);

router.put("/:id", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.update
);

router.delete("/:id", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.delete
);

// Assignment Filtering & Search
router.get("/course/:courseId", 
    authMiddleware, 
    assignmentController.findAll
);

router.get("/lesson/:lessonId", 
    authMiddleware, 
    assignmentController.findAll
);

// Student Assignment Views
router.get("/my/pending", 
    authMiddleware, 
    assignmentController.getMyPendingAssignments
);

router.get("/my/completed", 
    authMiddleware, 
    assignmentController.getMyCompletedAssignments
);

router.get("/my/upcoming", 
    authMiddleware, 
    assignmentController.getMyUpcomingAssignments
);

// Assignment Statistics (Instructor Only)
router.get("/:id/stats", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.getAssignmentStats
);

router.get("/:id/submissions", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.getAssignmentSubmissions
);

// Assignment Status Management
router.put("/:id/publish", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.publishAssignment
);

router.put("/:id/unpublish", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.unpublishAssignment
);

router.put("/:id/extend", 
    authMiddleware, 
    checkRole(["instructor"]), 
    assignmentController.extendDeadline
);

module.exports = router;
