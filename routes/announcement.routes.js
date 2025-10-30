const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcement.controller");

// Create a new announcement
router.post("/", announcementController.create);

// Get all announcements
router.get("/", announcementController.findAll);

// Get a single announcement by id
router.get("/:id", announcementController.findOne);

// Update an announcement
router.put("/:id", announcementController.update);

// Delete an announcement
router.delete("/:id", announcementController.delete);

module.exports = router;
