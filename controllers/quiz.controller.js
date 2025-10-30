const db = require("../models");
const Quiz = db.Quiz;

exports.create = async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
            include: ["lesson", "questions"]
        });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id, {
            include: ["lesson", "questions"]
        });
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: "Quiz not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = Quiz.primaryKeyAttribute;
        const updated = await Quiz.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Quiz updated successfully" });
        } else {
            res.status(404).json({ message: "Quiz not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = Quiz.primaryKeyAttribute;
        const deleted = await Quiz.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Quiz deleted successfully" });
        } else {
            res.status(404).json({ message: "Quiz not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};