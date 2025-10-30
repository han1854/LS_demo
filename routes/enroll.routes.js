const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollment.controller");

// Create a new enrollment
router.post("/", enrollmentController.create);

// Get all enrollments
router.get("/", enrollmentController.findAll);

// Get a single enrollment by id
router.get("/:id", enrollmentController.findOne);

// Update an enrollment
router.put("/:id", enrollmentController.update);

// Delete an enrollment
router.delete("/:id", enrollmentController.delete);

module.exports = router;
