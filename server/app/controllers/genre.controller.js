const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const db = require("../models");
const Genre = db.genres;

// Create and save a new genre
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("path").notEmpty().withMessage("Path is required").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { path } = req.body;

  const genreNames = path.split(" / ");
  let genre = null;
  let currentPath = "";

  for (const genreName of genreNames) {
    currentPath = currentPath ? `${currentPath} / ${genreName}` : genreName;

    [genre] = await Genre.findOrCreate({
      where: { name: genreName, path: currentPath },
    });
  }

  res.status(201).json(genre);
});

// Retrieve all genres
exports.findAll = asyncHandler(async (req, res) => {
  const genres = await Genre.findAll();
  res.json(genres);
});

// Find a single genre by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id, path } = req.params;

  var genre = null;
  if (id) {
    genre = await Genre.findByPk(id);
  } else if (path) {
    genre = await Genre.findOne({ where: { path } });
  }

  if (!genre) {
    return res.status(404).json({ error: "Genre not found" });
  }

  res.json(genre);
});

// Search by name or id
exports.search = asyncHandler(async (req, res) => {
  const { name, path, id } = req.query;
  let genres = [];

  if (id) {
    genres = await Genre.findAll({ where: { id } });
  } else if (name) {
    genres = await Genre.findAll({
      where: {
        name: { [Op.like]: `${name}%` },
      },
    });
  } else if (path) {
    genres = await Genre.findAll({
      where: {
        path: { [Op.like]: `%${path}%` },
      },
    });
  } else {
    return res
      .status(400)
      .json({ error: "Name, Path, or ID parameter is missing" });
  }

  res.json(genres);
});

// Update a genre by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("name").notEmpty().withMessage("Name is required").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, parentId } = req.body;

  const genre = await Genre.findByPk(id);

  if (!genre) {
    return res.status(404).json({ error: "Genre not found" });
  }

  // Find the parent genre if parentId is provided
  let parentGenre = null;
  if (parentId) {
    parentGenre = await Genre.findByPk(parentId);
    if (!parentGenre) {
      return res.status(404).json({ error: "Parent genre not found" });
    }
  }

  // Update the genre's properties
  genre.name = name;
  genre.parentId = parentId || null;
  genre.path = parentGenre
    ? `${parentGenre.path}/${slugify(name)}`
    : `/${slugify(name)}`;

  await genre.save();

  res.json(genre);
});

// Delete a genre by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const genre = await Genre.findByPk(id);

  if (!genre) {
    return res.status(404).json({ error: "Genre not found" });
  }

  // Check if any books or movies reference the genre
  const [associatedBooks, associatedMovies] = await Promise.all([
    genre.getBooks(),
    genre.getMovies(),
  ]);

  if (associatedBooks.length > 0 || associatedMovies.length > 0) {
    return res.status(400).json({
      error: "Cannot delete genre as it is associated with books or movies",
    });
  }

  await genre.destroy();

  res.json({ message: "Genre deleted successfully" });
});
