const { body, validationResult } = require("express-validator");

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user in the database
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || "USER",
        },
      });

      // Respond with success message
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      console.error("Error during sign-up:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);