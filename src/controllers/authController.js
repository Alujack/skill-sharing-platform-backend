const admin = require("../config/firebase");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🔐 Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { uid: user.uid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ Sign Up (Register)
exports.signup = async (req, res) => {
  try {
    const { email, password, displayName, phoneNumber, role } = req.body;
    console.log("email ==",email);
    console.log("password ==",password);
    console.log("displayName ==", displayName);

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "Email, password, and display name are required" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("i am here ");
    // Create Firebase User
    const userRecord = await admin.auth().createUser({
      email,
      displayName,
      phoneNumber: phoneNumber || "",
    });
    console.log("i am here 2");

    // Save user in database
    const user = await prisma.user.create({
      data: {
        uid: userRecord.uid,
        email,
        password: hashedPassword,
        displayName,
        phoneNumber,
        photoURL: userRecord.photoURL || "",
        role: role || "user",
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid password" });

    // Generate JWT Token
    const token = generateToken(user);

    res.json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Login with Firebase Token
exports.loginWithFirebase = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Fetch user from database
    let user = await prisma.user.findUnique({ where: { uid: firebaseUid } });

    // If user does not exist, create in DB
    if (!user) {
      const firebaseUser = await admin.auth().getUser(firebaseUid);
      user = await prisma.user.create({
        data: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || "",
          phoneNumber: firebaseUser.phoneNumber || "",
          role: "user",
        },
      });
    }

    // Generate JWT Token
    const jwtToken = generateToken(user);

    res.json({ message: "Login successful", user, token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get User Profile (Protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: req.user.uid },
      select: {
        uid: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        photoURL: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
};
