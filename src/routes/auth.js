// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "USER",
      },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Registration failed", error: error.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Logged in successfully", token });
  } catch (error) {
    res.status(400).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;