const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Function to generate a token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Function to verify a token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = { generateToken, verifyToken };