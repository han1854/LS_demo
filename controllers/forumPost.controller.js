const db = require("../models");
const ForumPost = db.ForumPost;

exports.create = async (req, res) => {
    try {
        const forumPost = await ForumPost.create(req.body);
        res.status(201).json(forumPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const forumPosts = await ForumPost.findAll({
            include: ["course", "user", "comments"]
        });
        res.json(forumPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const forumPost = await ForumPost.findByPk(req.params.id, {
            include: ["course", "user", "comments"]
        });
        if (forumPost) {
            res.json(forumPost);
        } else {
            res.status(404).json({ message: "Forum post not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = ForumPost.primaryKeyAttribute;
        const updated = await ForumPost.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Forum post updated successfully" });
        } else {
            res.status(404).json({ message: "Forum post not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = ForumPost.primaryKeyAttribute;
        const deleted = await ForumPost.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Forum post deleted successfully" });
        } else {
            res.status(404).json({ message: "Forum post not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};