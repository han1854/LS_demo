const db = require("../models");
const Course = db.Course;

exports.create = async (req, res) => {
    try {
        const { Title, Description, Category, Price } = req.body;
        const InstructorID = req.user.id;
        const course = await Course.create({
            Title,
            Description,
            Category,
            Price,
            InstructorID
        }, { fields: ['InstructorID','Title','Description','Category','Price'] });
        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', {
            message: error.message,
            original: error.original && error.original.message,
            sql: error.sql,
            stack: error.stack
        });

        res.status(500).json({
            message: error.message,
            dbMessage: error.original && error.original.message,
            sql: error.sql
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: ["lessons", "enrollments"]
        });
        res.json(courses);
    } catch (error) {
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
        const pk = Course.primaryKeyAttribute;
        const updated = await Course.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Course updated successfully" });
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
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