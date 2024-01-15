const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const db = require("../models");
const ProductionCompany = db.productionCompanies;

// Create and save a new production company or find an existing one
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("photo").trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, photo } = req.body;

  try {
    // Find an existing production company with the given name
    let productionCompany = await ProductionCompany.findOne({ name });

    if (productionCompany) {
      // If a production company with the given name exists, return it
      return res.status(200).json(productionCompany);
    } else {
      // If a production company with the given name does not exist, create a new one
      productionCompany = await ProductionCompany.create({ name, photo });
      return res.status(201).json(productionCompany);
    }
  } catch (error) {
    // Handle any errors that may occur during the find or create process
    return res.status(500).json({ error: "Server Error" });
  }
});

// Retrieve all production companies
exports.findAll = asyncHandler(async (req, res) => {
  const productionCompanies = await ProductionCompany.findAll();
  res.json(productionCompanies);
});

// Search by id or name
exports.search = asyncHandler(async (req, res) => {
  const { id, name, search } = req.query;

  let productionCompanies;
  try {
    if (id) {
      productionCompanies = await ProductionCompany.findAll({ where: { id } });
    } else if (search) {
      productionCompanies = await ProductionCompany.findAll({
        where: {
          [Op.or]: [{ name: { [Op.like]: `${search}%` } }],
        },
      });
    } else if (name) {
      productionCompanies = await ProductionCompany.findAll({
        where: { name },
      });
    } else {
      return res.json({});
    }
  } catch (error) {
    console.error("Error occurred during production company search:", error);
    return res.status(500).json({
      error: "An error occurred during production company search",
    });
  }

  if (!productionCompanies) {
    return res.json({});
  }

  res.json(productionCompanies);
});

// Find a single production company by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productionCompany = await ProductionCompany.findByPk(id);

  if (!productionCompany) {
    return res.status(404).json({ error: "Production Company not found" });
  }

  res.json(productionCompany);
});

// Update a production company by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("photo").trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, photo } = req.body;

  const productionCompany = await ProductionCompany.findByPk(id);

  if (!productionCompany) {
    return res.status(404).json({ error: "Production Company not found" });
  }

  // Update the production company's properties
  if (name) {
    productionCompany.name = name;
  }
  if (photo) {
    productionCompany.photo = photo;
  }

  await productionCompany.save();

  res.json(productionCompany);
});

// Delete an production company by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productionCompany = await ProductionCompany.findByPk(id);

  if (!productionCompany) {
    return res.status(404).json({ error: "Production Company not found" });
  }

  const associatedMovies = await productionCompany.getMovies();

  if (associatedMovies.length > 0) {
    return res.status(400).json({
      error: "Cannot delete production company as there are associated movies",
    });
  }

  await productionCompany.destroy();

  res.json({ message: "Production Company deleted successfully" });
});
