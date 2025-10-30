const db = require("../models");
const Enrollment = db.Enrollment;

exports.create = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { CourseID } = req.body;
        const UserID = req.user.id; // Assuming user ID is in request from auth middleware

        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({
            where: {
                UserID,
                CourseID
            }
        });

        if (existingEnrollment) {
            await transaction.rollback();
            return res.status(400).json({
                message: "You are already enrolled in this course"
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            UserID,
            CourseID,
            Status: 'active',
            Progress: 0
        }, { transaction });

        // Initialize progress for all lessons in the course
        const lessons = await db.Lesson.findAll({
            where: { CourseID },
            attributes: ['LessonID']
        });

        await Promise.all(lessons.map(lesson => 
            db.Progress.create({
                UserID,
                CourseID,
                LessonID: lesson.LessonID,
                Status: 'not-started'
            }, { transaction })
        ));

        await transaction.commit();

        // Fetch enrollment with related data
        const enrollmentWithData = await Enrollment.findByPk(enrollment.EnrollmentID, {
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ['UserID', 'FullName', 'Email']
                },
                {
                    model: db.Course,
                    as: "course",
                    include: ['lessons']
                }
            ]
        });

        res.status(201).json(enrollmentWithData);
    } catch (error) {
        await transaction.rollback();
        console.error('Enrollment creation error:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: "You are already enrolled in this course"
            });
        }
        
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const {
            userId,
            courseId,
            status,
            progress_min,
            progress_max,
            sort_by,
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build where clause
        const whereClause = {};
        if (userId) whereClause.UserID = userId;
        if (courseId) whereClause.CourseID = courseId;
        if (status) whereClause.Status = status;
        if (progress_min || progress_max) {
            whereClause.Progress = {};
            if (progress_min) whereClause.Progress[Op.gte] = progress_min;
            if (progress_max) whereClause.Progress[Op.lte] = progress_max;
        }

        // Build order clause
        const orderClause = [];
        if (sort_by) {
            orderClause.push([sort_by, order.toUpperCase()]);
        } else {
            orderClause.push(['EnrolledAt', 'DESC']);
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        const { count, rows: enrollments } = await Enrollment.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: parseInt(limit),
            offset: offset,
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ['UserID', 'FullName', 'Email']
                },
                {
                    model: db.Course,
                    as: "course",
                    include: [
                        {
                            model: db.User,
                            as: "instructor",
                            attributes: ['UserID', 'FullName']
                        }
                    ]
                }
            ]
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page),
            per_page: parseInt(limit),
            enrollments: enrollments
        });
    } catch (error) {
        console.error('Find enrollments error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const enrollment = await Enrollment.findByPk(req.params.id, {
            include: ["user", "course"]
        });
        if (enrollment) {
            res.json(enrollment);
        } else {
            res.status(404).json({ message: "Enrollment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updateData.EnrollmentID;
        delete updateData.UserID;
        delete updateData.CourseID;
        delete updateData.EnrolledAt;

        // Validate status if it's being updated
        if (updateData.Status && !['active', 'completed', 'dropped'].includes(updateData.Status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // Validate progress if it's being updated
        if (updateData.Progress !== undefined) {
            if (updateData.Progress < 0 || updateData.Progress > 100) {
                return res.status(400).json({ 
                    message: "Progress must be between 0 and 100" 
                });
            }
        }

        const [updated] = await Enrollment.update(updateData, {
            where: { EnrollmentID: req.params.id },
            returning: true,
            validate: true
        });

        if (updated === 1) {
            // If status changed to 'completed', update completion date
            if (updateData.Status === 'completed') {
                await Enrollment.update(
                    { CompletionDate: new Date() },
                    { where: { EnrollmentID: req.params.id } }
                );
            }

            const enrollment = await Enrollment.findByPk(req.params.id, {
                include: [
                    {
                        model: db.User,
                        as: "user",
                        attributes: ['UserID', 'FullName', 'Email']
                    },
                    {
                        model: db.Course,
                        as: "course",
                        include: ['lessons']
                    }
                ]
            });
            res.json(enrollment);
        } else {
            res.status(404).json({ message: "Enrollment not found" });
        }
    } catch (error) {
        console.error('Update enrollment error:', error);
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
        const pk = Enrollment.primaryKeyAttribute;
        const deleted = await Enrollment.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Enrollment deleted successfully" });
        } else {
            res.status(404).json({ message: "Enrollment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};