const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { validateUser } = require("../middleware/userValidation");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Public routes
router.post("/login", (req, res, next) => {
    console.log("Login request received:", req.body);
    userController.login(req, res, next);
});
router.post("/register", validateUser, userController.create);

// Protected routes
// Only admin can view all users
router.get("/", authMiddleware, checkRole(["admin"]), userController.findAll);
// User can view their own info, or admin can view any
router.get("/:id", authMiddleware, userController.findOne);
// User can update their own info, or admin/teacher can update any
router.put("/:id", authMiddleware, userController.update);
// Only admin can delete user
router.delete("/:id", authMiddleware, checkRole(["admin"]), userController.delete);

module.exports = router;
