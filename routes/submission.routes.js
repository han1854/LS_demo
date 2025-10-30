const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submission.controller");

// Create a new submission
router.post("/", submissionController.create);

// Get all submissions
router.get("/", submissionController.findAll);

// Get a single submission by id
router.get("/:id", submissionController.findOne);

// Update a submission
router.put("/:id", submissionController.update);

// Delete a submission
router.delete("/:id", submissionController.delete);

module.exports = router;
