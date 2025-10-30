const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const { authMiddleware } = require("../middleware/auth");

// Create rating
router.post("/course/:courseId", 
    authMiddleware, 
    ratingController.create
);

// Get course ratings
router.get("/course/:courseId", 
    ratingController.getByCourse
);

// Update rating
router.put("/:id", 
    authMiddleware, 
    ratingController.update
);

// Delete rating
router.delete("/:id", 
    authMiddleware, 
    ratingController.delete
);

module.exports = router;