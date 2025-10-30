const db = require("../models");
const Course = db.Course;

exports.create = async (req, res) => {
    try {
        const { 
            Title, 
            Description, 
            Category, 
            Price,
            ThumbnailURL,
            Duration 
        } = req.body;
        
        const InstructorID = req.user.id;
        
        // Validate required fields
        if (!Title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const course = await Course.create({
            Title,
            Description,
            Category,
            Price,
            InstructorID,
            ThumbnailURL,
            Duration,
            Status: 'draft' // Default status for new courses
        });

        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', {
            message: error.message,
            original: error.original && error.original.message,
            sql: error.sql,
            stack: error.stack
        });

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            message: error.message,
            dbMessage: error.original && error.original.message,
            sql: error.sql
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const { 
            status,
            category,
            instructor,
            search,
            price_min,
            price_max,
            sort_by,
            order = 'asc',
            page = 1,
            limit = 10
        } = req.query;

        // Build where clause
        const whereClause = {};
        if (status) whereClause.Status = status;
        if (category) whereClause.Category = category;
        if (instructor) whereClause.InstructorID = instructor;
        if (search) {
            whereClause[Op.or] = [
                { Title: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (price_min || price_max) {
            whereClause.Price = {};
            if (price_min) whereClause.Price[Op.gte] = price_min;
            if (price_max) whereClause.Price[Op.lte] = price_max;
        }

        // Build order clause
        const orderClause = [];
        if (sort_by) {
            orderClause.push([sort_by, order.toUpperCase()]);
        } else {
            orderClause.push(['CreatedAt', 'DESC']);
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        const { count, rows: courses } = await Course.findAndCountAll({
            where: whereClause,
            order: orderClause,
            include: ["lessons", "enrollments"],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            current_page: page,
            per_page: limit,
            courses: courses
        });
    } catch (error) {
        console.error('Find courses error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: ["lessons", "enrollments"]
        });
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updateData.CourseID;
        delete updateData.InstructorID;
        delete updateData.CreatedAt;
        
        // Validate status if it's being updated
        if (updateData.Status && !['draft', 'published', 'archived'].includes(updateData.Status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const [updated] = await Course.update(updateData, {
            where: { CourseID: req.params.id },
            returning: true,
            validate: true
        });

        if (updated === 1) {
            const course = await Course.findByPk(req.params.id, {
                include: ["lessons", "enrollments"]
            });
            res.json(course);
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
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
        const pk = Course.primaryKeyAttribute;
        const deleted = await Course.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Course deleted successfully" });
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};