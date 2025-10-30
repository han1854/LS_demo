const db = require("../models");
const Progress = db.Progress;

// Update lesson progress
exports.updateProgress = async (req, res) => {
    try {
        const { userId, courseId, lessonId } = req.params;
        const { status, timeSpent } = req.body;

        let progress = await Progress.findOne({
            where: {
                UserID: userId,
                CourseID: courseId,
                LessonID: lessonId
            }
        });

        if (progress) {
            progress = await progress.update({
                Status: status,
                TimeSpent: timeSpent,
                LastAccessDate: new Date(),
                CompletionDate: status === 'completed' ? new Date() : null
            });
        } else {
            progress = await Progress.create({
                UserID: userId,
                CourseID: courseId,
                LessonID: lessonId,
                Status: status,
                TimeSpent: timeSpent,
                LastAccessDate: new Date(),
                CompletionDate: status === 'completed' ? new Date() : null
            });
        }

        // Kiểm tra và cập nhật hoàn thành khóa học
        const allLessons = await db.Lesson.findAll({
            where: { CourseID: courseId }
        });

        const completedLessons = await Progress.count({
            where: {
                UserID: userId,
                CourseID: courseId,
                Status: 'completed'
            }
        });

        if (completedLessons === allLessons.length) {
            // Tự động tạo chứng chỉ nếu hoàn thành tất cả bài học
            const certificate = await db.Certificate.findOrCreate({
                where: {
                    UserID: userId,
                    CourseID: courseId
                },
                defaults: {
                    CompletionDate: new Date(),
                    Status: 'active'
                }
            });
        }

        res.json(progress);
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
                CourseID: courseId
            },
            include: [{
                model: db.Lesson,
                attributes: ['Title']
            }]
        });

        const allLessons = await db.Lesson.findAll({
            where: { CourseID: courseId }
        });

        const completedLessons = progress.filter(p => p.Status === 'completed').length;
        const totalTime = progress.reduce((acc, curr) => acc + (curr.TimeSpent || 0), 0);

        res.json({
            progress,
            summary: {
                totalLessons: allLessons.length,
                completedLessons,
                progressPercentage: (completedLessons / allLessons.length) * 100,
                totalTimeSpent: totalTime
            }
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
            include: [{
                model: db.Course,
                attributes: ['Title']
            }]
        });

        const progressData = [];

        for (const enrollment of enrollments) {
            const progress = await Progress.findAll({
                where: {
                    UserID: userId,
                    CourseID: enrollment.CourseID
                }
            });

            const allLessons = await db.Lesson.findAll({
                where: { CourseID: enrollment.CourseID }
            });

            const completedLessons = progress.filter(p => p.Status === 'completed').length;

            progressData.push({
                course: enrollment.Course.Title,
                totalLessons: allLessons.length,
                completedLessons,
                progressPercentage: (completedLessons / allLessons.length) * 100,
                lastAccess: progress.reduce((latest, curr) => {
                    return curr.LastAccessDate > latest ? curr.LastAccessDate : latest;
                }, new Date(0))
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
                [db.sequelize.fn('AVG', db.sequelize.col('TimeSpent')), 'avgTime']
            ],
            group: ['Status']
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};