const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller.compat.js");
const { authMiddleware, checkRole } = require("../middleware/auth");

router.post("/:postId", authMiddleware, commentController.create);
router.get("/post/:postId", commentController.getPostComments);
router.put("/:id", authMiddleware, commentController.update);
router.delete("/:id", authMiddleware, commentController.delete);
router.post("/:id/reply", authMiddleware, commentController.reply);
router.put("/:id/moderate", authMiddleware, checkRole(['admin', 'instructor']), commentController.moderate);

module.exports = router;
