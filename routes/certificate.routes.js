const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificate.controller");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Issue certificate (teacher/admin only)
router.post("/issue/:courseId/:userId", 
    authMiddleware, 
    checkRole(['teacher', 'admin']), 
    certificateController.issue
);

// Verify certificate (public)
router.get("/verify/:certNumber", 
    certificateController.verify
);

// Get user certificates
router.get("/user/:userId", 
    authMiddleware, 
    certificateController.getUserCertificates
);

// Revoke certificate (admin only)
router.put("/revoke/:id", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.revoke
);

module.exports = router;