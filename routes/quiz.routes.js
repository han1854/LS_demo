const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");

// Create a new quiz
router.post("/", quizController.create);

// Get all quizzes
router.get("/", quizController.findAll);

// Get a single quiz by id
router.get("/:id", quizController.findOne);

// Update a quiz
router.put("/:id", quizController.update);

// Delete a quiz
router.delete("/:id", quizController.delete);

module.exports = router;
