const db = require("../models");
const Assignment = db.Assignment;

exports.create = async (req, res) => {
    try {
        const assignment = await Assignment.create(req.body);
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const assignments = await Assignment.findAll({
            include: ["lesson", "submissions"]
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id, {
            include: ["lesson", "submissions"]
        });
        if (assignment) {
            res.json(assignment);
        } else {
            res.status(404).json({ message: "Assignment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = Assignment.primaryKeyAttribute;
        const updated = await Assignment.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Assignment updated successfully" });
        } else {
            res.status(404).json({ message: "Assignment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = Assignment.primaryKeyAttribute;
        const deleted = await Assignment.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Assignment deleted successfully" });
        } else {
            res.status(404).json({ message: "Assignment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};