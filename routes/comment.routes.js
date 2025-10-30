const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");

// Create a new comment
router.post("/", commentController.create);

// Get all comments
router.get("/", commentController.findAll);

// Get a single comment by id
router.get("/:id", commentController.findOne);

// Update a comment
router.put("/:id", commentController.update);

// Delete a comment
router.delete("/:id", commentController.delete);

module.exports = router;
