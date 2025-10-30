const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Create notification (admin/teacher only)
router.post("/", 
    authMiddleware, 
    checkRole(['admin', 'teacher']), 
    notificationController.create
);

// Get user notifications
router.get("/user/:userId", 
    authMiddleware, 
    notificationController.getUserNotifications
);

// Mark as read
router.put("/read/:id", 
    authMiddleware, 
    notificationController.markAsRead
);

// Mark all as read
router.put("/read-all/:userId", 
    authMiddleware, 
    notificationController.markAllAsRead
);

// Delete notification
router.delete("/:id", 
    authMiddleware, 
    notificationController.delete
);

// Get unread count
router.get("/count/:userId", 
    authMiddleware, 
    notificationController.getCount
);

module.exports = router;