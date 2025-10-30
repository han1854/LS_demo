const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller.compat.js");
const { authMiddleware, checkRole } = require("../middleware/auth");
const { validateFile } = require("../middleware/validations");
const { uploadConfig } = require("../config/upload.config");

// File Upload Routes
router.post("/upload/lesson/:lessonId",
    authMiddleware,
    checkRole(['instructor']),
    uploadConfig.single('file'),
    validateFile,
    fileController.uploadLessonMaterial
);

router.post("/upload/assignment/:assignmentId",
    authMiddleware,
    uploadConfig.array('files', 10),
    validateFile,
    fileController.uploadAssignmentFiles
);

router.post("/upload/submission/:submissionId",
    authMiddleware,
    uploadConfig.array('files', 5),
    validateFile,
    fileController.uploadSubmissionFiles
);

// File Access Routes
router.get("/lesson/:lessonId",
    authMiddleware,
    fileController.getLessonFiles
);

router.get("/assignment/:assignmentId",
    authMiddleware,
    fileController.getAssignmentFiles
);

router.get("/submission/:submissionId",
    authMiddleware,
    fileController.getSubmissionFiles
);

// File Download Routes
router.get("/:id/download",
    authMiddleware,
    fileController.downloadFile
);

router.post("/bulk-download",
    authMiddleware,
    fileController.downloadMultipleFiles
);

// File Management
router.put("/:id/rename",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.renameFile
);

router.put("/:id/move",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.moveFile
);

router.delete("/:id",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.deleteFile
);

router.post("/bulk-delete",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.deleteMultipleFiles
);

// File Properties
router.get("/:id/metadata",
    authMiddleware,
    fileController.getFileMetadata
);

router.put("/:id/metadata",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.updateFileMetadata
);

// File Access Control
router.put("/:id/permissions",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.updateFilePermissions
);

router.get("/:id/permissions",
    authMiddleware,
    fileController.getFilePermissions
);

// File Preview
router.get("/:id/preview",
    authMiddleware,
    fileController.previewFile
);

router.get("/:id/thumbnail",
    authMiddleware,
    fileController.getFileThumbnail
);

// File Analytics
router.get("/analytics/usage",
    authMiddleware,
    checkRole(['admin']),
    fileController.getStorageUsageAnalytics
);

router.get("/analytics/downloads",
    authMiddleware,
    checkRole(['instructor', 'admin']),
    fileController.getDownloadAnalytics
);

// Virus Scanning
router.post("/:id/scan",
    authMiddleware,
    checkRole(['admin']),
    fileController.scanFile
);

router.get("/:id/scan-results",
    authMiddleware,
    checkRole(['admin']),
    fileController.getFileScanResults
);

module.exports = router;