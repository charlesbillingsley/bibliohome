const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const db = require("../models");
const Series = db.series;

// Create and save a new series or find an existing one
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("description").trim().run(req);
  await body("photo").trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, photo } = req.body;

  try {
    // Find an existing sereis with the given name
    let series = await Series.findOne({ name });

    if (series) {
      // If a series with the given name exists, return it
      return res.status(200).json(series);
    } else {
      // If a series with the given name does not exist, create a new one
      series = await Series.create({ name, description, photo });
      return res.status(201).json(series);
    }
  } catch (error) {
    // Handle any errors that may occur during the find or create process
    return res.status(500).json({ error: "Server Error" });
  }
});

// Retrieve all series
exports.findAll = asyncHandler(async (req, res) => {
  const series = await Series.findAll();
  res.json(series);
});

// Search by id or name
exports.search = asyncHandler(async (req, res) => {
  const { id, name, search } = req.query;

  let series;
  try {
    if (id) {
      series = await Series.findAll({ where: { id } });
    } else if (search) {
      series = await Series.findAll({
        where: {
          [Op.or]: [{ name: { [Op.like]: `${search}%` } }],
        },
      });
    } else if (name) {
      series = await Series.findAll({
        where: { name },
      });
    } else {
      return res.json({});
    }
  } catch (error) {
    console.error("Error occurred during series search:", error);
    return res.status(500).json({
      error: "An error occurred during series search",
    });
  }

  if (!series) {
    return res.json({});
  }

  res.json(series);
});

// Find a single series by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const series = await Series.findByPk(id);

  if (!series) {
    return res.status(404).json({ error: "Series not found" });
  }

  res.json(series);
});

// Update a series by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("description").trim().run(req);
  await body("photo").trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, photo } = req.body;

  const series = await Series.findByPk(id);

  if (!series) {
    return res.status(404).json({ error: "Series not found" });
  }

  // Update the series' properties
  if (name) {
    series.name = name;
  }
  if (description) {
    series.description = description;
  }
  if (photo) {
    series.photo = photo;
  }

  await series.save();

  res.json(series);
});

// Delete an series by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const series = await Series.findByPk(id);

  if (!series) {
    return res.status(404).json({ error: "Series not found" });
  }

  const associatedMovies = await series.getMovies();

  if (associatedMovies.length > 0) {
    return res.status(400).json({
      error: "Cannot delete series as there are associated movies",
    });
  }

  const associatedBooks = await series.getBooks();

  if (associatedBooks.length > 0) {
    return res.status(400).json({
      error: "Cannot delete series as there are associated books",
    });
  }

  await series.destroy();

  res.json({ message: "Series deleted successfully" });
});
