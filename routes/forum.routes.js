const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumPost.controller");

// Create a new forum post
router.post("/", forumController.create);

// Get all forum posts
router.get("/", forumController.findAll);

// Get a single forum post by id
router.get("/:id", forumController.findOne);

// Update a forum post
router.put("/:id", forumController.update);

// Delete a forum post
router.delete("/:id", forumController.delete);

module.exports = router;