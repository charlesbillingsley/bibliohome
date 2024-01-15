const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const db = require("../models");
const Author = db.authors;
const Book = db.books;

// Create and save a new author
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .run(req);
  await body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName } = req.body;

  // Create a new author instance
  const author = await Author.create({
    firstName,
    lastName,
  });

  res.status(201).json(author);
});

// Retrieve all authors
exports.findAll = asyncHandler(async (req, res) => {
  const authors = await Author.findAll();
  res.json(authors);
});

// Search by id or firstName and lastName
exports.search = asyncHandler(async (req, res) => {
  const { id, firstName, lastName, search } = req.query;

  let authors;
  try {
    if (id) {
      authors = await Author.findAll({ where: { id } });
    } else if (search) {
      authors = await Author.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.like]: `${search}%` } },
            { lastName: { [Op.like]: `${search}%` } },
          ],
        },
      });
    } else if (firstName && lastName) {
      authors = await Author.findAll({ where: { firstName, lastName } });
    } else {
      return res.json({});
    }
  } catch (error) {
    console.error("Error occurred during author search:", error);
    return res.status(500).json({
      error: "An error occurred during author search",
    });
  }

  if (!authors) {
    return res.json({});
  }

  res.json(authors);
});

// Find a single author by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const author = await Author.findByPk(id);

  if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  res.json(author);
});

// Update an author by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .run(req);
  await body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName } = req.body;

  const author = await Author.findByPk(id);

  if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  // Update the author's properties
  author.firstName = firstName;
  author.lastName = lastName;

  await author.save();

  res.json(author);
});

// Delete an author by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [author, associatedBooks] = await Promise.all([
    Author.findByPk(id),
    Book.findOne({ where: { authorId: id } }),
  ]);

  if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  if (associatedBooks) {
    return res
      .status(400)
      .json({ error: "Cannot delete author as there are associated books" });
  }

  await author.destroy();

  res.json({ message: "Author deleted successfully" });
});
