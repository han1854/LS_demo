const db = require("../models");
const Notification = db.Notification;
const { Op } = require("sequelize");

// Create notification
exports.create = async (req, res) => {
    try {
        const { title, message, type, relatedId, userIds } = req.body;

        // Có thể gửi cho nhiều user
        if (userIds && userIds.length > 0) {
            const notifications = await Promise.all(
                userIds.map(userId =>
                    Notification.create({
                        UserID: userId,
                        Title: title,
                        Message: message,
                        Type: type,
                        RelatedID: relatedId
                    })
                )
            );
            res.status(201).json(notifications);
        } else {
            const notification = await Notification.create({
                UserID: req.body.userId,
                Title: title,
                Message: message,
                Type: type,
                RelatedID: relatedId
            });
            res.status(201).json(notification);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const where = { UserID: userId };
        if (unreadOnly) {
            where.IsRead = false;
        }

        const notifications = await Notification.findAndCountAll({
            where,
            order: [['CreatedAt', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit
        });

        res.json({
            notifications: notifications.rows,
            total: notifications.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(notifications.count / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.UserID !== req.user.id) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await notification.update({ IsRead: true });
        res.json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.update(
            { IsRead: true },
            { 
                where: { 
                    UserID: userId,
                    IsRead: false
                } 
            }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete notification
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.UserID !== req.user.id) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await notification.destroy();
        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get notification count
exports.getCount = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const count = await Notification.count({
            where: {
                UserID: userId,
                IsRead: false
            }
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};