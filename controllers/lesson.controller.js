const db = require("../models");
const Lesson = db.Lesson;

exports.create = async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);
        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const lessons = await Lesson.findAll({
            include: ["course", "assignments", "quizzes"]
        });
        res.json(lessons);
    } catch (error) {
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
        const pk = Lesson.primaryKeyAttribute;
        const updated = await Lesson.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Lesson updated successfully" });
        } else {
            res.status(404).json({ message: "Lesson not found" });
        }
    } catch (error) {
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