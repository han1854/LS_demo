const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller");

// Create a new lesson
router.post("/", lessonController.create);

// Get all lessons
router.get("/", lessonController.findAll);

// Get a single lesson by id
router.get("/:id", lessonController.findOne);

// Update a lesson
router.put("/:id", lessonController.update);

// Delete a lesson
router.delete("/:id", lessonController.delete);

module.exports = router;
