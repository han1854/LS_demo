const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");

// Create a new assignment
router.post("/", assignmentController.create);

// Get all assignments
router.get("/", assignmentController.findAll);

// Get a single assignment by id
router.get("/:id", assignmentController.findOne);

// Update an assignment
router.put("/:id", assignmentController.update);

// Delete an assignment
router.delete("/:id", assignmentController.delete);

module.exports = router;
