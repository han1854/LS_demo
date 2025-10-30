const baseController = require("./notification.controller");

// Create and send notification
exports.createNotification = async (req, res) => {
    return baseController.create(req, res);
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
    return baseController.getUserNotifications(req, res);
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
    return baseController.markAsRead(req, res);
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
    return baseController.markAllAsRead(req, res);
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    return baseController.delete(req, res);
};

// Get unread notification count
exports.getNotificationCount = async (req, res) => {
    return baseController.getCount(req, res);
};

// Notification subscription management
exports.subscribeToNotifications = async (req, res) => {
    res.status(501).json({ 
        success: false,
        message: "Notification subscription not implemented" 
    });
};

exports.unsubscribeFromNotifications = async (req, res) => {
    res.status(501).json({ 
        success: false,
        message: "Notification unsubscription not implemented" 
    });
};

// Notification preferences
exports.updateNotificationPreferences = async (req, res) => {
    res.status(501).json({ 
        success: false,
        message: "Notification preferences update not implemented" 
    });
};

exports.getNotificationPreferences = async (req, res) => {
    res.status(501).json({ 
        success: false,
        message: "Notification preferences retrieval not implemented" 
    });
};