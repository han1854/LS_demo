const express = require('express');
const router = express.Router();
const categories = require('../controllers/category.controller.js');
const { authJwt } = require('../middleware');
const { validateCategory } = require('../middleware/validations.js');

// Create a new Category (Admin only)
router.post('/', [authJwt.verifyToken, authJwt.isAdmin, validateCategory], categories.create);

// Retrieve all Categories
router.get('/', categories.findAll);

// Retrieve a single Category with id
router.get('/:id', categories.findOne);

// Update a Category with id (Admin only)
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin, validateCategory], categories.update);

// Delete a Category with id (Admin only)
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], categories.delete);

module.exports = router;
