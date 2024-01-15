const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const MediaType = db.mediaTypes;
const Library = db.libraries;
const Op = db.Sequelize.Op;

// Create and Save a new MediaType
exports.create = asyncHandler(async (req, res) => {
  // Validate
  await body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim()

    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    // Check if the MediaType already exists in the database
    const existingMediaType = await MediaType.findOne({ where: { name } });
    if (existingMediaType) {
      return res
        .status(400)
        .json({ error: "MediaType with the same name already exists" });
    }

    // Create a new MediaType
    const newMediaType = await MediaType.create({ name });

    res.status(201).json(newMediaType);
  } catch (error) {
    res.status(500).json({ error: "Failed to create MediaType " + error });
  }
});

// Retrieve all MediaTypes from the database.
exports.findAll = (req, res) => {
  const { name } = req.query;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  MediaType.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving MediaTypes.",
      });
    });
};

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
    const mediaTypes = await MediaType.findAll({
      where: whereCondition,
    });

    res.json(mediaTypes);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve MediaTypes from the database",
    });
  }
});

// Find a single MediaType with an id
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const mediaType = await MediaType.findByPk(id);

    if (!mediaType) {
      return res.status(404).json({ error: "MediaType not found" });
    }

    res.json(mediaType);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve MediaType from the database " + error,
    });
  }
});

// Update a MediaType by the id in the request
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the request body using express-validator
  await body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim()

    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const mediaType = await MediaType.findByPk(id);

    if (!mediaType) {
      return res.status(404).json({ error: "MediaType not found" });
    }

    mediaType.name = name; // Update the name property with the new value
    await mediaType.save(); // Save the updated MediaType

    res.json(mediaType);
  } catch (error) {
    res.status(500).json({ error: "Failed to update MediaType " + error });
  }
});

// Delete a MediaType with the specified id in the request
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const [mediaType, associatedLibraries] = await Promise.all([
      MediaType.findByPk(id),
      Library.findOne({ where: { mediaTypeId: id } }),
    ]);

    if (!mediaType) {
      return res.status(404).json({ error: "MediaType not found" });
    }

    if (associatedLibraries) {
      return res
        .status(400)
        .json({
          error:
            "Cannot delete MediaType as it is associated with one or more Libraries",
        });
    }

    await mediaType.destroy(); // Delete the MediaType

    res.json({ message: "MediaType deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete MediaType " + error });
  }
});
