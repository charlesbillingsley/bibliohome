const { body, validationResult } = require("express-validator");
const validator = require("validator");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const db = require("../models");
const bcrypt = require("bcrypt");
const User = db.users;

// Helpers
function generatePassword(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
}

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate request body using express-validator
  await body("username")
    .notEmpty()
    .withMessage("Username is required")
    .run(req);
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Find the user by username
  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Compare the provided password with the stored password hash
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json(user);
});

// Create and save a new user
exports.create = asyncHandler(async (req, res) => {
  await body("username")
    .notEmpty()
    .withMessage("User name is required")
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { username: value } });
      if (existingUser) {
        return Promise.reject("Username already exists");
      }
    })
    .run(req);
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);
  await body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { email: value } });
      if (existingUser) {
        return Promise.reject("Email already exists");
      }
    })
    .run(req);
  await body("firstName").trim().run(req);
  await body("lastName").trim().run(req);
  await body("dateOfBirth").optional().isISO8601().toDate().run(req);
  await body("address").optional().trim().run(req);
  await body("phone").optional().trim().run(req);
  await body("role").optional().trim().run(req);
  await body("photo").optional().trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    username,
    dateOfBirth,
    email,
    address,
    phone,
    password,
    role,
    photo,
  } = req.body;

  // Create a new user instance
  const user = await User.create({
    firstName,
    lastName,
    username,
    dateOfBirth,
    email,
    address,
    phone,
    password,
    role,
    photo,
  });

  res.status(201).json(user);
});

// Retrieve all users
exports.findAll = asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Find a single user by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// Update a user by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("username")
    .optional()
    .custom(async (value) => {
      const existingUser = await User.findOne({
        where: { username: value, id: { [db.Sequelize.Op.ne]: id } },
      });
      if (existingUser && existingUser.id !== id) {
        return Promise.reject("Username already exists");
      }
    })
    .run(req);
  await body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value) => {
      const existingUser = await User.findOne({
        where: { email: value, id: { [db.Sequelize.Op.ne]: id } },
      });
      if (existingUser && existingUser.id !== id) {
        return Promise.reject("Email already exists");
      }
    })
    .run(req);
  await body("firstName").optional().trim().run(req);
  await body("lastName").optional().trim().run(req);
  await body("dateOfBirth")
    .optional()
    .custom((value) => {
      if (value && !validator.isISO8601(value)) {
        throw new Error("Invalid date format");
      }
      return true;
    })
    .toDate()
    .run(req);
  await body("address").optional().trim().run(req);
  await body("phone").optional().trim().run(req);
  await body("role").optional().trim().run(req);
  await body("photo").optional().trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    username,
    dateOfBirth,
    email,
    address,
    phone,
    password,
    role,
    photo,
  } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Update the user's properties
  if (firstName) {
    user.firstName = firstName;
  }
  if (lastName) {
    user.lastName = lastName;
  }
  if (username) {
    user.username = username;
  }
  if (dateOfBirth) {
    user.dateOfBirth = dateOfBirth;
  }
  if (email) {
    user.email = email;
  }
  if (address) {
    user.address = address;
  }
  if (phone) {
    user.phone = phone;
  }
  if (password) {
    user.password = password;
  }
  if (role) {
    user.role = role;
  }
  if (photo) {
    user.photo = photo;
  }

  await user.save();

  res.json(user);
});

// Delete a user by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await user.destroy();

  res.json({ message: "User deleted successfully" });
});

// Email the user's password to them
exports.resetPassword = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const email = req.body.email;

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newPassword = generatePassword();

  // Update the user's password in the database
  user.password = newPassword;
  await user.save();

  // Send the password to the user via email
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "charles.billingsley.robot",
        pass: "hgpyorgbarnvnkxz",
      },
    });

    const mailOptions = {
      from: "charles.billingsley.robot@gmail.com",
      to: user.email,
      subject: "Bibliohome Password Reset",
      text: `Your new Bibliohome password: ${newPassword}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});
