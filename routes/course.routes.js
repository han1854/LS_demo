const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");

const { authMiddleware, checkRole } = require("../middleware/auth");

router.post("/", authMiddleware, checkRole(["teacher", "admin"]), courseController.create);

router.get("/", courseController.findAll);

router.get("/:id", courseController.findOne);

router.put("/:id", authMiddleware, checkRole(["teacher", "admin"]), courseController.update);

router.delete("/:id", authMiddleware, checkRole(["teacher", "admin"]), courseController.delete);

module.exports = router;
