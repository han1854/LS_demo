const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificate.controller.compat.js");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Certificate Generation
router.post("/course/:courseId/generate", 
    authMiddleware, 
    checkRole(['instructor', 'admin']), 
    certificateController.generateCertificate
);

router.post("/batch/generate", 
    authMiddleware, 
    checkRole(['instructor', 'admin']), 
    certificateController.generateBatchCertificates
);

// Certificate Management
router.put("/:id/issue", 
    authMiddleware, 
    checkRole(['instructor', 'admin']), 
    certificateController.issueCertificate
);

router.put("/:id/revoke", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.revokeCertificate
);

router.put("/:id/reissue", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.reissueCertificate
);

// Certificate Access
router.get("/my", 
    authMiddleware, 
    certificateController.getMyCertificates
);

router.get("/:id", 
    authMiddleware, 
    certificateController.getCertificateDetails
);

router.get("/:id/download", 
    authMiddleware, 
    certificateController.downloadCertificate
);

// Certificate Verification
router.get("/verify/:certNumber", 
    certificateController.verifyCertificate
);

router.get("/verify/:certNumber/details", 
    certificateController.getCertificateVerificationDetails
);

// Certificate Templates
router.get("/templates", 
    authMiddleware, 
    checkRole(['instructor', 'admin']), 
    certificateController.getCertificateTemplates
);

router.post("/templates", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.createCertificateTemplate
);

router.put("/templates/:id", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.updateCertificateTemplate
);

// Certificate Analytics
router.get("/analytics/overview", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.getCertificateAnalytics
);

router.get("/course/:courseId/stats", 
    authMiddleware, 
    checkRole(['instructor', 'admin']), 
    certificateController.getCourseCertificateStats
);

// Certificate History
router.get("/:id/history", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.getCertificateHistory
);

// Bulk Operations
router.post("/bulk/verify", 
    certificateController.bulkVerifyCertificates
);

router.post("/bulk/revoke", 
    authMiddleware, 
    checkRole(['admin']), 
    certificateController.bulkRevokeCertificates
);

module.exports = router;