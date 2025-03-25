// routes/protected.js
const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const router = express.Router();

// Protected route for all authenticated users
router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Profile accessed successfully", user: req.user });
});

// Protected route for admins only
router.get("/admin", authenticate, authorize(["ADMIN"]), (req, res) => {
  res.json({ message: "Admin dashboard accessed successfully" });
});

module.exports = router;