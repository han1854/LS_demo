const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumPost.controller.compat.js");
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public Forum Access
router.get("/", authMiddleware, forumController.findAll);
router.get("/:id", authMiddleware, forumController.findOne);
router.get("/course/:courseId", authMiddleware, forumController.getCoursePosts);
router.get("/popular", authMiddleware, forumController.getPopularPosts);
router.get("/recent", authMiddleware, forumController.getRecentPosts);
router.get("/search", authMiddleware, forumController.searchPosts);

// User Post Management
router.post("/", authMiddleware, forumController.create);
router.put("/:id", authMiddleware, forumController.update);
router.delete("/:id", authMiddleware, forumController.delete);
router.get("/my/posts", authMiddleware, forumController.getMyPosts);

// Post Interactions
router.post("/:id/like", authMiddleware, forumController.likePost);
router.post("/:id/unlike", authMiddleware, forumController.unlikePost);
router.get("/:id/likes", authMiddleware, forumController.getLikes);

// Comments
router.get("/:id/comments", authMiddleware, forumController.getComments);
router.post("/:id/comments", authMiddleware, forumController.addComment);
router.put("/:id/comments/:commentId", authMiddleware, forumController.updateComment);
router.delete("/:id/comments/:commentId", authMiddleware, forumController.deleteComment);

// Moderation (Instructor/Admin)
router.put("/:id/pin", authMiddleware, checkRole(['instructor', 'admin']), forumController.pinPost);
router.put("/:id/unpin", authMiddleware, checkRole(['instructor', 'admin']), forumController.unpinPost);
router.put("/:id/close", authMiddleware, checkRole(['instructor', 'admin']), forumController.closePost);
router.put("/:id/reopen", authMiddleware, checkRole(['instructor', 'admin']), forumController.reopenPost);

// Categories and Tags
router.get("/categories", authMiddleware, forumController.getCategories);
router.get("/tags", authMiddleware, forumController.getTags);
router.get("/category/:categoryId", authMiddleware, forumController.getPostsByCategory);
router.get("/tag/:tagId", authMiddleware, forumController.getPostsByTag);

// Analytics (Admin Only)
router.get("/analytics/overview", authMiddleware, checkRole(['admin']), forumController.getForumAnalytics);
router.get("/analytics/user-engagement", authMiddleware, checkRole(['admin']), forumController.getUserEngagement);

module.exports = router;