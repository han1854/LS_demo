const db = require("../models");
const Rating = db.Rating;

// Create rating
exports.create = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { score, comment } = req.body;

        // Kiểm tra đã đăng ký khóa học chưa
        const enrollment = await db.Enrollment.findOne({
            where: { 
                CourseID: courseId,
                UserID: req.user.id 
            }
        });

        if (!enrollment) {
            return res.status(403).json({ 
                message: "You must be enrolled in the course to rate it" 
            });
        }

        const rating = await Rating.create({
            CourseID: courseId,
            UserID: req.user.id,
            Score: score,
            Comment: comment
        });

        res.status(201).json(rating);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                message: "You have already rated this course" 
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get ratings by course
exports.getByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const ratings = await Rating.findAll({
            where: { CourseID: courseId },
            include: [{
                model: db.User,
                attributes: ['FullName']
            }],
            order: [['CreatedAt', 'DESC']]
        });

        // Tính điểm trung bình
        const avgScore = ratings.reduce((acc, curr) => acc + curr.Score, 0) / ratings.length;

        res.json({
            ratings,
            averageScore: avgScore || 0,
            totalRatings: ratings.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update rating
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, comment } = req.body;

        const rating = await Rating.findByPk(id);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        if (rating.UserID !== req.user.id) {
            return res.status(403).json({ 
                message: "You can only update your own rating" 
            });
        }

        await rating.update({ Score: score, Comment: comment });
        res.json(rating);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete rating
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findByPk(id);

        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        if (rating.UserID !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: "Permission denied" 
            });
        }

        await rating.destroy();
        res.json({ message: "Rating deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};