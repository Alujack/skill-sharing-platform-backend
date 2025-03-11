const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllCourses = async (req, res) => {
  const courses = await prisma.course.findMany();
  res.json(courses);
};

const createCourse = async (req, res) => {
  const { title, description, instructorId } = req.body;
  const course = await prisma.course.create({
    data: { title, description, instructorId },
  });
  res.json(course);
};

module.exports = { getAllCourses, createCourse };