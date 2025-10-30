const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");

// Create a new transaction
router.post("/", transactionController.create);

// Get all transactions
router.get("/", transactionController.findAll);

// Get a single transaction by id
router.get("/:id", transactionController.findOne);

// Update a transaction
router.put("/:id", transactionController.update);

// Delete a transaction
router.delete("/:id", transactionController.delete);

module.exports = router;
