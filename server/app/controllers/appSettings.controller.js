const { body, validationResult } = require("express-validator");
const validator = require("validator");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const AppSettings = db.appSettings;

// Create and save a new settings entry
exports.create = asyncHandler(async (req, res) => {
  await body("emailService").trim().run(req);
  await body("emailUsername").trim().run(req);
  await body("emailPassKey").trim().run(req);
  await body("movieApiKey").trim().run(req);
  await body("bookApiKey").trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    emailService,
    emailUsername,
    emailPassKey,
    movieApiKey,
    bookApiKey
  } = req.body;

  // Create a new appSettings instance
  const appSettings = await AppSettings.create({
    emailService,
    emailUsername,
    emailPassKey,
    movieApiKey,
    bookApiKey,
  });

  res.status(201).json(appSettings);
});

// Find a single settings entry by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appSettings = await AppSettings.findByPk(id);

  if (!appSettings) {
    return res.status(404).json({ error: "App Settings not found" });
  }

  res.json(appSettings);
});

// Update a settings entry by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("emailService").trim().run(req);
  await body("emailUsername").trim().run(req);
  await body("emailPassKey").trim().run(req);
  await body("movieApiKey").trim().run(req);
  await body("bookApiKey").trim().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    emailService,
    emailUsername,
    emailPassKey,
    movieApiKey,
    bookApiKey
  } = req.body;

  const appSettings = await AppSettings.findByPk(id);

  if (!appSettings) {
    return res.status(404).json({ error: "App Settings not found" });
  }

  // Update the appSettings properties
  if (emailService) {
    appSettings.emailService = emailService;
  }
  if (emailUsername) {
    appSettings.emailUsername = emailUsername;
  }
  if (emailPassKey) {
    appSettings.emailPassKey = emailPassKey;
  }
  if (movieApiKey) {
    appSettings.movieApiKey = movieApiKey;
  }
  if (bookApiKey) {
    appSettings.bookApiKey = bookApiKey;
  }

  await appSettings.save();

  res.json(appSettings);
});

// Delete a settings entry by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appSettings = await AppSettings.findByPk(id);

  if (!appSettings) {
    return res.status(404).json({ error: "App Settings not found" });
  }

  await appSettings.destroy();

  res.json({ message: "App Settings deleted successfully" });
});
