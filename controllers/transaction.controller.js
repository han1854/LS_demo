const db = require('../models');
const Transaction = db.Transaction;
const { buildUserResponse } = require('../utils/userHelper');

exports.create = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: ['user', 'course'],
    });
    // Transform user data in transactions
    const transformedTransactions = transactions.map(transaction => {
      const plainTransaction = transaction.get();
      if (plainTransaction.user) {
        plainTransaction.user = buildUserResponse(plainTransaction.user);
      }
      return plainTransaction;
    });
    res.json(transformedTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: ['user', 'course'],
    });
    if (transaction) {
      const plainTransaction = transaction.get();
      if (plainTransaction.user) {
        plainTransaction.user = buildUserResponse(plainTransaction.user);
      }
      res.json(plainTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const pk = Transaction.primaryKeyAttribute;
    const updated = await Transaction.update(req.body, {
      where: { [pk]: req.params.id },
    });
    if (updated[0] === 1) {
      res.json({ message: 'Transaction updated successfully' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pk = Transaction.primaryKeyAttribute;
    const deleted = await Transaction.destroy({ where: { [pk]: req.params.id } });
    if (deleted === 1) {
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
