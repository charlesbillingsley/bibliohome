const { body, validationResult } = require("express-validator");
const { Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const MovieInstance = db.movieInstances;
const Movie = db.movies;
const User = db.users;
const Library = db.libraries;

// Create and save a new movie instance
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("status").notEmpty().withMessage("Status is required").run(req);
  await body("dueback")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Invalid due back date")
    .run(req);
  await body("movieId").notEmpty().withMessage("Movie ID is required").run(req);
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

  const { status, dueback, movieId, userId, libraryIds } = req.body;

  // Check if the associated movie exists
  const movieExists = await Movie.findByPk(movieId);
  if (!movieExists) {
    return res.status(404).json({ error: "Movie not found" });
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

  // Create a new movie instance
  let movieInstance = await MovieInstance.create({
    status,
    dueback,
    movieId,
    userId,
  });

  // Update the relationship between MovieInstance and Library
  if (libraryIds) {
    await movieInstance.addLibraries(libraryIds);
  }

  movieInstance = await MovieInstance.findByPk(movieInstance.id, {
    include: [
      Library,
      Movie,
    ]
  });

  res.status(201).json(movieInstance);
});

// Retrieve all movie instances
exports.findAll = asyncHandler(async (req, res) => {
  const movieInstances = await MovieInstance.findAll();
  res.json(movieInstances);
});

// Search by libraryId with pagination
exports.search = asyncHandler(async (req, res) => {
  let { libraryId, page = 1, pageSize = 10 } = req.query;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);

  let movieInstances;
  try {
    if (libraryId) {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      movieInstances = await MovieInstance.findAndCountAll({
        include: [
          {
            model: Library,
            where: { id: libraryId },
            through: { attributes: [] }, // Exclude join table attributes
          },
          Movie,
        ],
        offset,
        limit,
        order: [
          [
            Sequelize.literal(
              "CASE WHEN `Movie`.`title` LIKE 'The %' THEN SUBSTRING(`Movie`.`title`, 5) " +
                "WHEN `Movie`.`title` LIKE 'A %' THEN SUBSTRING(`Movie`.`title`, 3) " +
                "WHEN `Movie`.`title` LIKE 'An %' THEN SUBSTRING(`Movie`.`title`, 4) " +
                "ELSE `Movie`.`title` END"
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
    console.error("Error occurred during movie instance search:", error);
    return res.status(500).json({
      error: "An error occurred during movie instance search",
    });
  }

  res.json(movieInstances);
});

// Find a single movie instance by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const movieInstance = await MovieInstance.findByPk(id);

  if (!movieInstance) {
    return res.status(404).json({ error: "Movie instance not found" });
  }

  res.json(movieInstance);
});

// Update a movie instance by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("status").notEmpty().withMessage("Status is required").run(req);
  await body("dueback")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Invalid due back date")
    .run(req);
  await body("movieId").notEmpty().withMessage("Movie ID is required").run(req);
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

  const { status, dueback, movieId, userId, libraryIds } = req.body;

  const movieInstance = await MovieInstance.findByPk(id);

  if (!movieInstance) {
    return res.status(404).json({ error: "Movie instance not found" });
  }

  // Check if the associated movie exists
  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
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

  // Update the movie instance's properties
  movieInstance.status = status;
  movieInstance.dueback = dueback;
  movieInstance.movieId = movieId;
  movieInstance.userId = userId;

  await movieInstance.save();

  if (libraryIds) {
    await movieInstance.setLibraries(libraryIds);
  }

  res.json(movieInstance);
});

// Delete a movie instance by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const movieInstance = await MovieInstance.findByPk(id);

  if (!movieInstance) {
    return res.status(404).json({ error: "Movie instance not found" });
  }

  await movieInstance.destroy();

  res.json({ message: "Movie instance deleted successfully" });
});
