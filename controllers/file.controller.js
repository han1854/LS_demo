const db = require('../models');
const File = db.File;
const path = require('path');
const fs = require('fs').promises;

// Upload file
exports.upload = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const file = req.file; // Từ multer middleware

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = await File.create({
      LessonID: lessonId,
      FileName: file.originalname,
      FileType: path.extname(file.originalname).toLowerCase(),
      FilePath: file.path,
      FileSize: file.size,
      UploadedBy: req.user.id,
    });

    res.status(201).json(fileData);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get files by lesson
exports.getByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const files = await File.findAll({
      where: { LessonID: lessonId },
      include: [
        {
          model: db.User,
          as: 'uploader',
          attributes: ['FirstName', 'LastName'],
        },
      ],
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download file
exports.download = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.download(file.FilePath, file.FileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete file
exports.delete = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Kiểm tra quyền xóa
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'teacher' &&
      file.UploadedBy !== req.user.id
    ) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await fs.unlink(file.FilePath);
    await file.destroy();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
