const db = require("../models");
const Announcement = db.Announcement;

exports.create = async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const announcements = await Announcement.findAll({
            include: ["course"]
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id, {
            include: ["course"]
        });
        if (announcement) {
            res.json(announcement);
        } else {
            res.status(404).json({ message: "Announcement not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pk = Announcement.primaryKeyAttribute;
        const updated = await Announcement.update(req.body, {
            where: { [pk]: req.params.id }
        });
        if (updated[0] === 1) {
            res.json({ message: "Announcement updated successfully" });
        } else {
            res.status(404).json({ message: "Announcement not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const pk = Announcement.primaryKeyAttribute;
        const deleted = await Announcement.destroy({ where: { [pk]: req.params.id } });
        if (deleted === 1) {
            res.json({ message: "Announcement deleted successfully" });
        } else {
            res.status(404).json({ message: "Announcement not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};