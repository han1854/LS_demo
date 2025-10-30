const db = require("../models");
const Lesson = db.Lesson;

exports.create = async (req, res) => {
    try {
        const {
            CourseID,
            Title,
            Description,
            VideoURL,
            Content,
            Duration,
            OrderIndex
        } = req.body;

        // Validate required fields
        if (!CourseID || !Title) {
            return res.status(400).json({
                message: "CourseID and Title are required"
            });
        }

        // Get max OrderIndex for the course if not provided
        if (OrderIndex === undefined) {
            const maxOrder = await Lesson.max('OrderIndex', {
                where: { CourseID: CourseID }
            });
            req.body.OrderIndex = (maxOrder || 0) + 1;
        }

        const lesson = await Lesson.create({
            CourseID,
            Title,
            Description,
            VideoURL,
            Content,
            Duration,
            OrderIndex: req.body.OrderIndex,
            Status: 'draft'
        });

        // Return created lesson with related data
        const createdLesson = await Lesson.findByPk(lesson.LessonID, {
            include: ["course", "assignments", "quizzes"]
        });

        res.status(201).json(createdLesson);
    } catch (error) {
        console.error('Create lesson error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const {
            courseId,
            status,
            search,
            sort_by,
            order = 'asc',
            page = 1,
            limit = 10
        } = req.query;

        // Build where clause
        const whereClause = {};
        if (courseId) whereClause.CourseID = courseId;
        if (status) whereClause.Status = status;
        if (search) {
            whereClause[Op.or] = [
                { Title: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Build order clause
        const orderClause = [];
        if (sort_by) {
            orderClause.push([sort_by, order.toUpperCase()]);
        } else {
            // Default ordering by CourseID and OrderIndex
            orderClause.push(['CourseID', 'ASC']);
            orderClause.push(['OrderIndex', 'ASC']);
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        const { count, rows: lessons } = await Lesson.findAndCountAll({
            where: whereClause,
            order: orderClause,
            include: ["course", "assignments", "quizzes"],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page),
            per_page: parseInt(limit),
            lessons: lessons
        });
    } catch (error) {
        console.error('Find lessons error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const lesson = await Lesson.findByPk(req.params.id, {
            include: ["course", "assignments", "quizzes"]
        });
        if (lesson) {
            res.json(lesson);
        } else {
            res.status(404).json({ message: "Lesson not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updateData.LessonID;
        delete updateData.CourseID; // CourseID shouldn't be changed
        delete updateData.CreatedAt;
        
        // Validate status if it's being updated
        if (updateData.Status && !['draft', 'published', 'archived'].includes(updateData.Status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // If updating OrderIndex, validate and adjust other lessons
        if (updateData.OrderIndex !== undefined) {
            const lesson = await Lesson.findByPk(req.params.id);
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }

            // Reorder other lessons if necessary
            if (updateData.OrderIndex !== lesson.OrderIndex) {
                await sequelize.transaction(async (t) => {
                    if (updateData.OrderIndex > lesson.OrderIndex) {
                        // Moving down: decrease OrderIndex of lessons in between
                        await Lesson.update(
                            { OrderIndex: sequelize.literal('OrderIndex - 1') },
                            {
                                where: {
                                    CourseID: lesson.CourseID,
                                    OrderIndex: {
                                        [Op.gt]: lesson.OrderIndex,
                                        [Op.lte]: updateData.OrderIndex
                                    }
                                },
                                transaction: t
                            }
                        );
                    } else {
                        // Moving up: increase OrderIndex of lessons in between
                        await Lesson.update(
                            { OrderIndex: sequelize.literal('OrderIndex + 1') },
                            {
                                where: {
                                    CourseID: lesson.CourseID,
                                    OrderIndex: {
                                        [Op.gte]: updateData.OrderIndex,
                                        [Op.lt]: lesson.OrderIndex
                                    }
                                },
                                transaction: t
                            }
                        );
                    }
                });
            }
        }

        const [updated] = await Lesson.update(updateData, {
            where: { LessonID: req.params.id },
            returning: true,
            validate: true
        });

        if (updated === 1) {
            const lesson = await Lesson.findByPk(req.params.id, {
                include: ["course", "assignments", "quizzes"]
            });
            res.json(lesson);
        } else {
            res.status(404).json({ message: "Lesson not found" });
        }
    } catch (error) {
        console.error('Update lesson error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = Lesson.primaryKeyAttribute;
        const deleted = await Lesson.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Lesson deleted successfully" });
        } else {
            res.status(404).json({ message: "Lesson not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};