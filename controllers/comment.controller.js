const db = require("../models");
const Comment = db.Comment;

exports.create = async (req, res) => {
    try {
        const comment = await Comment.create(req.body);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            include: ["user", "forumPost"]
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id, {
            include: ["user", "forumPost"]
        });
        if (comment) {
            res.json(comment);
        } else {
            res.status(404).json({ message: "Comment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = Comment.primaryKeyAttribute;
        const updated = await Comment.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Comment updated successfully" });
        } else {
            res.status(404).json({ message: "Comment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = Comment.primaryKeyAttribute;
        const deleted = await Comment.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Comment deleted successfully" });
        } else {
            res.status(404).json({ message: "Comment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};