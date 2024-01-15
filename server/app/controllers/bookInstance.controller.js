const { body, validationResult } = require("express-validator");
const { Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const BookInstance = db.bookInstances;
const Book = db.books;
const User = db.users;
const Library = db.libraries;

// Create and save a new book instance
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("status").notEmpty().withMessage("Status is required").run(req);
  await body("dueback")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Invalid due back date")
    .run(req);
  await body("bookId").notEmpty().withMessage("Book ID is required").run(req);
  await body("userId")
    .optional()
    .notEmpty()
    .withMessage("User ID cannot be empty")
    .run(req);
  await body("libraryIds")
    .optional()
    .isArray()
    .withMessage("Library IDs must be an array")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, dueback, bookId, userId, libraryIds } = req.body;

  // Check if the associated book exists
  const bookExists = await Book.findByPk(bookId);
  if (!bookExists) {
    return res.status(400).json({ error: "Invalid Book ID" });
  }

  // Check if the associated user exists
  if (userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  }

  // Check if the associated libraries exist
  if (libraryIds) {
    const libraries = await Library.findAll({
      where: { id: libraryIds },
    });
    if (libraries.length !== libraryIds.length) {
      return res.status(400).json({ error: "Invalid Library ID(s)" });
    }
  }

  // Create a new book instance
  let bookInstance = await BookInstance.create({
    status,
    dueback,
    bookId,
    userId,
  });

  // Update the relationship between BookInstance and Library
  if (libraryIds) {
    await bookInstance.addLibraries(libraryIds);
  }
  
  bookInstance = await BookInstance.findByPk(bookInstance.id, {
    include: [
      Library,
      Book,
    ]
  });

  res.status(201).json(bookInstance);
});

// Retrieve all book instances
exports.findAll = asyncHandler(async (req, res) => {
  const bookInstances = await BookInstance.findAll({
    include: Book,
    order: [
      [
        Sequelize.literal(
          "CASE WHEN `Book`.`title` LIKE 'The %' THEN SUBSTRING(`Book`.`title`, 5) " +
            "WHEN `Book`.`title` LIKE 'A %' THEN SUBSTRING(`Book`.`title`, 3) " +
            "WHEN `Book`.`title` LIKE 'An %' THEN SUBSTRING(`Book`.`title`, 4) " +
            "ELSE `Book`.`title` END"
        ),
        "ASC",
      ],
    ],
  });
  res.json(bookInstances);
});

// Search by libraryId with pagination
exports.search = asyncHandler(async (req, res) => {
  let { libraryId, page = 1, pageSize = 10 } = req.query;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);

  let bookInstances;
  try {
    if (libraryId) {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      bookInstances = await BookInstance.findAndCountAll({
        include: [
          {
            model: Library,
            where: { id: libraryId },
            through: { attributes: [] }, // Exclude join table attributes
          },
          Book,
        ],
        offset,
        limit,
        order: [
          [
            Sequelize.literal(
              "CASE WHEN `Book`.`title` LIKE 'The %' THEN SUBSTRING(`Book`.`title`, 5) " +
                "WHEN `Book`.`title` LIKE 'A %' THEN SUBSTRING(`Book`.`title`, 3) " +
                "WHEN `Book`.`title` LIKE 'An %' THEN SUBSTRING(`Book`.`title`, 4) " +
                "ELSE `Book`.`title` END"
            ),
            "ASC",
          ],
        ],
        subQuery: false,
      });
    } else {
      return res.json([]);
    }
  } catch (error) {
    console.error("Error occurred during book instance search:", error);
    return res.status(500).json({
      error: "An error occurred during book instance search",
    });
  }

  res.json(bookInstances);
});

// Find a single book instance by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookInstance = await BookInstance.findByPk(id, { include: Book });

  if (!bookInstance) {
    return res.status(404).json({ error: "Book instance not found" });
  }

  res.json(bookInstance);
});

// Update a book instance by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("status").notEmpty().withMessage("Status is required").run(req);
  await body("dueback")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Invalid due back date")
    .run(req);
  await body("bookId").notEmpty().withMessage("Book ID is required").run(req);
  await body("userId")
    .optional()
    .notEmpty()
    .withMessage("User ID cannot be empty")
    .run(req);
  await body("libraryIds")
    .optional()
    .isArray()
    .withMessage("Library IDs must be an array")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, dueback, bookId, userId, libraryIds } = req.body;

  const bookInstance = await BookInstance.findByPk(id);

  if (!bookInstance) {
    return res.status(404).json({ error: "Book instance not found" });
  }

  // Check if the associated book exists
  const bookExists = await Book.findByPk(bookId);
  if (!bookExists) {
    return res.status(400).json({ error: "Invalid Book ID" });
  }

  // Check if the associated user exists
  if (userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  }

  // Check if the associated libraries exist
  if (libraryIds) {
    const libraries = await Library.findAll({
      where: { id: libraryIds },
    });
    if (libraries.length !== libraryIds.length) {
      return res.status(400).json({ error: "Invalid Library ID(s)" });
    }
  }

  // Update the book instance's properties
  bookInstance.status = status;
  bookInstance.dueback = dueback;
  bookInstance.bookId = bookId;
  bookInstance.userId = userId;

  await bookInstance.save();

  if (libraryIds) {
    await bookInstance.setLibraries(libraryIds);
  }

  res.json(bookInstance);
});

// Delete a book instance by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookInstance = await BookInstance.findByPk(id);

  if (!bookInstance) {
    return res.status(404).json({ error: "Book instance not found" });
  }

  await bookInstance.destroy();

  res.json({ message: "Book instance deleted successfully" });
});
