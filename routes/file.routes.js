const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const { authMiddleware, checkRole } = require("../middleware/auth");
const multer = require("multer");

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Upload file
router.post("/upload/:lessonId", 
    authMiddleware, 
    checkRole(['teacher', 'admin']), 
    upload.single('file'), 
    fileController.upload
);

// Get files by lesson
router.get("/lesson/:lessonId", 
    authMiddleware, 
    fileController.getByLesson
);

// Download file
router.get("/download/:id", 
    authMiddleware, 
    fileController.download
);

// Delete file
router.delete("/:id", 
    authMiddleware, 
    fileController.delete
);

module.exports = router;