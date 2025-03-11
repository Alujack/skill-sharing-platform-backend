const express = require("express");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/", courseController.getAllCourses);
router.post("/", courseController.createCourse);

module.exports = router;