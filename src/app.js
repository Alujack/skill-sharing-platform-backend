const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const router = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protected");
const { swaggerUi, specs } = require("./config/swagger");

dotenv.config();
const app = express();

app.use(express.json());

// Swagger API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/auth", router);
app.use("/protected", protectedRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
