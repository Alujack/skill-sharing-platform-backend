const admin = require("../config/firebase");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ uid: user.uid, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ✅ Sign Up
exports.signup = async (req, res) => {
  try {
    const { email, displayName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Create Firebase User
    const userRecord = await admin.auth().createUser({
      email,
      displayName,
    });

    // Save user in database
    const user = await prisma.user.create({
      data: {
        uid: userRecord.uid,
        email,
        displayName,
        photoURL: userRecord.photoURL || "",
      },
    });

    // Generate JWT Token
    const token = generateToken(user);

    res.json({ message: "User registered successfully", user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { uid } = req.body;

    // Fetch user from Firebase
    const userRecord = await admin.auth().getUser(uid);
    if (!userRecord) return res.status(400).json({ error: "User not found in Firebase" });

    // Fetch user from database
    let user = await prisma.user.findUnique({ where: { uid } });

    // If user does not exist, create in DB
    if (!user) {
      user = await prisma.user.create({
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL || "",
        },
      });
    }

    // Generate JWT Token
    const token = generateToken(user);

    res.json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: req.user.uid },
      select: { uid: true, email: true, displayName: true, photoURL: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
};
