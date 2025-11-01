const db = require('../models');
const Progress = db.Progress;

// Update lesson progress
exports.updateProgress = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { userId, courseId, lessonId } = req.params;
    const { status, timeSpent, score, notes } = req.body;

    // Validate status
    if (!['not-started', 'in-progress', 'completed'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find existing progress
    let progress = await Progress.findOne({
      where: {
        UserID: userId,
        CourseID: courseId,
        LessonID: lessonId,
      },
      transaction,
    });

    if (progress) {
      // Update existing progress
      progress = await progress.update(
        {
          Status: status,
          TimeSpent: (progress.TimeSpent || 0) + (timeSpent || 0),
          LastAccessDate: new Date(),
          CompletionDate: status === 'completed' ? new Date() : null,
          Score: score !== undefined ? score : progress.Score,
          Notes: notes !== undefined ? notes : progress.Notes,
        },
        { transaction },
      );
    } else {
      // Create new progress
      progress = await Progress.create(
        {
          UserID: userId,
          CourseID: courseId,
          LessonID: lessonId,
          Status: status,
          TimeSpent: timeSpent || 0,
          LastAccessDate: new Date(),
          CompletionDate: status === 'completed' ? new Date() : null,
          Score: score,
          Notes: notes,
        },
        { transaction },
      );
    }

    // Update course enrollment progress
    const totalLessons = await db.Lesson.count({
      where: { CourseID: courseId },
      transaction,
    });

    const completedLessons = await Progress.count({
      where: {
        UserID: userId,
        CourseID: courseId,
        Status: 'completed',
      },
      transaction,
    });

    const progressPercentage = (completedLessons / totalLessons) * 100;

    // Kiểm tra và cập nhật hoàn thành khóa học
    // Update enrollment
    await db.Enrollment.update(
      {
        Progress: progressPercentage,
        Status: progressPercentage === 100 ? 'completed' : 'active',
        LastAccessDate: new Date(),
      },
      {
        where: {
          UserID: userId,
          CourseID: courseId,
        },
        transaction,
      },
    );

    // If course is completed, generate certificate
    if (progressPercentage === 100) {
      // Generate certificate number
      const certificateNumber = `CERT-${courseId}-${userId}-${Date.now()}`;

      // Create or update certificate
      await db.Certificate.findOrCreate({
        where: {
          UserID: userId,
          CourseID: courseId,
        },
        defaults: {
          CertificateNumber: certificateNumber,
          CompletionDate: new Date(),
          IssueDate: new Date(),
          Status: 'active',
        },
        transaction,
      });

      // Create notification for course completion
      await db.Notification.create(
        {
          UserID: userId,
          Title: 'Course Completed!',
          Message: `Congratulations! You have completed the course and earned a certificate.`,
          Type: 'achievement',
          RelatedID: courseId,
        },
        { transaction },
      );
    }

    await transaction.commit();

    // Return updated progress with related data
    const updatedProgress = await Progress.findOne({
      where: {
        UserID: userId,
        CourseID: courseId,
        LessonID: lessonId,
      },
      include: [
        {
          model: db.Lesson,
          attributes: ['Title', 'Description'],
        },
      ],
    });

    res.json(updatedProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await Progress.findAll({
      where: {
        UserID: userId,
        CourseID: courseId,
      },
      include: [
        {
          model: db.Lesson,
          attributes: ['Title'],
        },
      ],
    });

    const allLessons = await db.Lesson.findAll({
      where: { CourseID: courseId },
    });

    const completedLessons = progress.filter(p => p.Status === 'completed').length;
    const totalTime = progress.reduce((acc, curr) => acc + (curr.TimeSpent || 0), 0);

    res.json({
      progress,
      summary: {
        totalLessons: allLessons.length,
        completedLessons,
        progressPercentage: (completedLessons / allLessons.length) * 100,
        totalTimeSpent: totalTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user progress for all courses
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await db.Enrollment.findAll({
      where: { UserID: userId },
      include: [
        {
          model: db.Course,
          attributes: ['Title'],
        },
      ],
    });

    const progressData = [];

    for (const enrollment of enrollments) {
      const progress = await Progress.findAll({
        where: {
          UserID: userId,
          CourseID: enrollment.CourseID,
        },
      });

      const allLessons = await db.Lesson.findAll({
        where: { CourseID: enrollment.CourseID },
      });

      const completedLessons = progress.filter(p => p.Status === 'completed').length;

      progressData.push({
        course: enrollment.Course.Title,
        totalLessons: allLessons.length,
        completedLessons,
        progressPercentage: (completedLessons / allLessons.length) * 100,
        lastAccess: progress.reduce((latest, curr) => {
          return curr.LastAccessDate > latest ? curr.LastAccessDate : latest;
        }, new Date(0)),
      });
    }

    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lesson statistics
exports.getLessonStats = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const stats = await Progress.findAll({
      where: { LessonID: lessonId },
      attributes: [
        'Status',
        [db.sequelize.fn('COUNT', db.sequelize.col('Status')), 'count'],
        [db.sequelize.fn('AVG', db.sequelize.col('TimeSpent')), 'avgTime'],
      ],
      group: ['Status'],
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
