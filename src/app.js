const express = require("express");
const { PrismaClient } = require("@prisma/client");
const courseRoutes = require("./routes/courseRoutes");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Routes
app.use("/api/courses", courseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});