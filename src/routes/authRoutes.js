const express = require("express");
const { signup, login, getProfile } = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

module.exports = router;
