const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Library = db.libraries;
const Op = db.Sequelize.Op;

// Create and Save a new Library
exports.create = asyncHandler(async (req, res) => {
  // Validate
  await body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .run(req);
  await body("icon")
    .isString()
    .withMessage("Icon must be a string")
    .trim()
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, icon } = req.body;

  try {
    // Create a new Library
    const newLibrary = await Library.create({ name, icon });

    res.status(201).json(newLibrary);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Library " + error });
  }
});

// Retrieve all Libraries from the database.
exports.findAll = asyncHandler(async (req, res) => {
  const { name } = req.query;
  let whereCondition = {};

  if (name) {
    whereCondition = {
      name: {
        [Op.like]: `%${name}%`,
      },
    };
  }

  try {
    const libraries = await Library.findAll({
      where: whereCondition,
    });

    res.json(libraries);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve Libraries from the database " + error,
    });
  }
});

// Find a single Library with an id
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const library = await Library.findByPk(id);

    if (!library) {
      return res.status(404).json({ error: "Library not found" });
    }

    res.json(library);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve Library from the database " + error,
    });
  }
});

// Update a Library by the id in the request
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the request body using express-validator
  await body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()

    .run(req);

  await body("icon")
    .isString()
    .withMessage("Icon must be a string")
    .trim()
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, icon } = req.body;

  try {
    const library = await Library.findByPk(id);

    if (!library) {
      return res.status(404).json({ error: "Library not found" });
    }

    if (name) {
      library.name = name;
    }
    if (icon) {
      library.icon = icon;
    }
    await library.save();

    res.json(library);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Library " + error });
  }
});

// Delete a Library with the specified id in the request
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const library = await Library.findByPk(id);

    if (!library) {
      return res.status(404).json({ error: "Library not found" });
    }

    await library.destroy(); // Delete the Library

    res.json({ message: "Library deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Library " + error });
  }
});
