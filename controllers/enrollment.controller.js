const db = require("../models");
const Enrollment = db.Enrollment;

exports.create = async (req, res) => {
    try {
        const enrollment = await Enrollment.create(req.body);
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            include: ["user", "course"]
        });
        res.json(enrollments);
    } catch (error) {
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
        const pk = Enrollment.primaryKeyAttribute;
        const updated = await Enrollment.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Enrollment updated successfully" });
        } else {
            res.status(404).json({ message: "Enrollment not found" });
        }
    } catch (error) {
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