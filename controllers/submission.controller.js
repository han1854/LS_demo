const db = require('../models');
const Submission = db.Submission;

exports.create = async (req, res) => {
  try {
    const submission = await Submission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      include: ['assignment'],
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: ['assignment'],
    });
    if (submission) res.json(submission);
    else res.status(404).json({ message: 'Submission not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const pk = Submission.primaryKeyAttribute;
    const updated = await Submission.update(req.body, { where: { [pk]: req.params.id } });
    if (updated[0] === 1) res.json({ message: 'Submission updated successfully' });
    else res.status(404).json({ message: 'Submission not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pk = Submission.primaryKeyAttribute;
    const deleted = await Submission.destroy({ where: { [pk]: req.params.id } });
    if (deleted === 1) res.json({ message: 'Submission deleted successfully' });
    else res.status(404).json({ message: 'Submission not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
