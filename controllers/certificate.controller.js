const db = require('../models');
const Certificate = db.Certificate;
const { v4: uuidv4 } = require('uuid');

// Issue certificate
exports.issue = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    // Kiểm tra hoàn thành khóa học
    const progress = await db.Progress.findAll({
      where: {
        CourseID: courseId,
        UserID: userId,
      },
    });

    const allLessons = await db.Lesson.findAll({
      where: { CourseID: courseId },
    });

    if (progress.length < allLessons.length) {
      return res.status(400).json({
        message: 'Student has not completed all lessons',
      });
    }

    // Kiểm tra đã có chứng chỉ chưa
    const existingCert = await Certificate.findOne({
      where: {
        CourseID: courseId,
        UserID: userId,
      },
    });

    if (existingCert) {
      return res.status(400).json({
        message: 'Certificate already issued',
      });
    }

    // Tạo số chứng chỉ unique
    const certNumber = `CERT-${uuidv4().substring(0, 8)}`;

    const certificate = await Certificate.create({
      CourseID: courseId,
      UserID: userId,
      CertificateNumber: certNumber,
      CompletionDate: new Date(),
      Status: 'active',
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify certificate
exports.verify = async (req, res) => {
  try {
    const { certNumber } = req.params;
    const certificate = await Certificate.findOne({
      where: { CertificateNumber: certNumber },
      include: [
        {
          model: db.User,
          attributes: ['FirstName', 'LastName'],
        },
        {
          model: db.Course,
          attributes: ['Title'],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        message: 'Certificate not found',
      });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user certificates
exports.getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;
    const certificates = await Certificate.findAll({
      where: { UserID: userId },
      include: [
        {
          model: db.Course,
          attributes: ['Title'],
        },
      ],
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revoke certificate
exports.revoke = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Chỉ admin mới được thu hồi chứng chỉ
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await certificate.update({ Status: 'revoked' });
    res.json({ message: 'Certificate revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
