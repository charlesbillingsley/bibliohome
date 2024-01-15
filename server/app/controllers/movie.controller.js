const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const Movie = db.movies;
const ProductionCompany = db.productionCompanies;
const Genre = db.genres;
const User = db.users;
const MovieInstance = db.movieInstances;
const Library = db.libraries;
const UserMovie = db.userMoives;

// Create and save a new movie
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("title").notEmpty().withMessage("Title is required").run(req);
  await body("releaseDate")
    .notEmpty()
    .withMessage("Release Date is required")
    .isDate()
    .withMessage("Invalid date")
    .run(req);
  await body("subtitle").trim().run(req);
  await body("budget").trim().run(req);
  await body("revenue").trim().run(req);
  await body("runtime").trim().run(req);
  await body("description").trim().run(req);
  await body("upc").trim().run(req);
  await body("photo").trim().run(req);
  await body("genres.*").run(req);
  await body("productionCompanies.*").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    releaseDate,
    description,
    subtitle,
    budget,
    revenue,
    runtime,
    upc,
    photo,
    genres,
    productionCompanies,
  } = req.body;

  // Check if the associated genres exist
  var collectedGenres = [];
  for (const genreInfo of genres) {
    const genreName = genreInfo.name;
    [genre, genreCreated] = await Genre.findOrCreate({
      where: { name: genreName, path: genreName }, // TMDB doesn't provide paths
    });

    collectedGenres.push(genre);
  }

  // Check if the associated production companies exist
  var collectedProductionCompanies = [];
  for (const productionCompanyInfo of productionCompanies) {
    const name = productionCompanyInfo.name;
    const pcPhoto = productionCompanyInfo.photoPath;

    let search = { name };
    if (pcPhoto) {
      search["photo"] = pcPhoto;
    }

    try {
      // Search for an existing production company based on name
      let productionCompany = await ProductionCompany.findOne({
        where: { name },
      });

      if (!productionCompany) {
        // If production company doesn't exist, create a new one with name and photo
        productionCompany = await ProductionCompany.create({
          name,
          photo: pcPhoto,
        });
      }

      collectedProductionCompanies.push(productionCompany);
    } catch (error) {
      console.error(
        "Error occurred while creating/finding production company:",
        error
      );
      return res.status(500).json({
        error: "An error occurred while creating/finding production company.",
      });
    }
  }

  // Create a new movie instance
  const movie = await Movie.create({
    title,
    releaseDate,
    description,
    subtitle,
    budget,
    revenue,
    runtime,
    upc,
    photo,
  });

  if (collectedProductionCompanies.length > 0) {
    await movie.setProductionCompanies(
      collectedProductionCompanies.map(
        (productionCompany) => productionCompany.id
      )
    );
  }
  if (collectedGenres.length > 0) {
    await movie.setMovieGenres(collectedGenres.map((genre) => genre.id));
  }

  res.status(201).json(movie);
});

// Retrieve all movies
exports.findAll = asyncHandler(async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (error) {
    console.error("Error occurred while fetching movies:", error);
    return res.status(500).json({
      error: "An error occurred while fetching movies",
    });
  }
});

// Search by id or title/date
exports.search = asyncHandler(async (req, res) => {
  const { id, title, releaseDate } = req.query;

  let movie;
  try {
    if (id) {
      movie = await Movie.findOne({
        where: { id },
        include: [
          { model: ProductionCompany, as: "productionCompanies" },
          { model: Genre, as: "movieGenres" },
        ],
      });
    } else if (title && releaseDate) {
      // Convert releaseDate to ISO 8601 format
      const isoReleaseDate = new Date(releaseDate).toISOString();

      movie = await Movie.findOne({
        where: { title, releaseDate:isoReleaseDate },
        include: [
          { model: ProductionCompany, as: "productionCompanies" },
          { model: Genre, as: "movieGenres" },
        ],
      });
    } else {
      return res.json({});
    }
  } catch (error) {
    console.error("Error occurred during movie search:", error);
    return res.status(500).json({
      error: "An error occurred during movie search",
    });
  }

  if (!movie) {
    return res.json({});
  }

  // Find libraries that have this movie already
  try {
    const movieInstances = await MovieInstance.findAll({
      where: { movieId: movie.id },
      include: {
        model: Library,
        through: "libraryMovieInstance",
      },
    });

    const libraryIds = movieInstances
      .map((instance) => instance.Libraries)
      .flat()
      .map((library) => library.id);

    const uniqueLibraries = [...new Set(libraryIds)];

    res.json({ movie, libraries: uniqueLibraries });
  } catch (error) {
    console.error("Error occurred while retrieving movie instances:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving movie instances",
    });
  }
});

// Find a single movie by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findByPk(id, { include: Genre });

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(movie);
});

// Update a movie by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("title").trim().run(req);
  await body("releaseDate").isDate().withMessage("Invalid date").run(req);
  await body("description").trim().run(req);
  await body("subtitle").trim().run(req);
  await body("budget").trim().run(req);
  await body("revenue").trim().run(req);
  await body("runtime").trim().run(req);
  await body("upc").trim().run(req);
  await body("photo").trim().run(req);
  await body("genres.*").run(req);
  await body("productionCompanies.*").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    releaseDate,
    description,
    subtitle,
    budget,
    revenue,
    runtime,
    upc,
    photo,
    genres,
    productionCompanies,
  } = req.body;

  const movie = await Movie.findByPk(id);

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // Check if the associated production companies exist
  var collectedProductionCompanies = [];
  if (productionCompanies) {
    for (const productionCompanyItem of productionCompanies) {
      let productionCompanyData = productionCompanyItem;

      if (typeof productionCompanyItem == "string") {
        let name = "";
        let photoPath = "";
        let id = -1;

        productionCompanyData = { id, firstName, lastName };
      }

      let productionCompany = null;
      let productionCompanyCreated = false;
      if (productionCompanyData.id >= 0) {
        productionCompany = await ProductionCompany.findByPk(
          productionCompanyData.id
        );
      } else {
        search = {
          name: productionCompanyData.name,
        };
        if (productionCompanyData.photoPath) {
          search["photo"] = productionCompanyData.photoPath;
        }

        [productionCompany, productionCompanyCreated] =
          await ProductionCompany.findOrCreate({
            where: search,
          });
      }

      if (productionCompany) {
        collectedProductionCompanies.push(productionCompany);
      }
    }
  }

  // Check if the associated genres exist
  var collectedGenres = [];
  if (genres) {
    for (const genreItem of genres) {
      let genreData = genreItem;

      if (typeof genreItem == "string") {
        genreData = { id: -1, path: genreItem };
      }
      const genreNames = genreData.path.split(" / ");
      let genre = null;
      let currentPath = "";

      for (const genreName of genreNames) {
        currentPath = currentPath ? `${currentPath} / ${genreName}` : genreName;

        [genre, genreCreated] = await Genre.findOrCreate({
          where: { name: genreName, path: currentPath },
        });
      }

      collectedGenres.push(genre);
    }
  }

  // Update the movie's properties
  if (title) {
    movie.title = title;
  }
  if (releaseDate) {
    movie.releaseDate = releaseDate;
  }
  if (description) {
    movie.description = description;
  }
  if (subtitle) {
    movie.subtitle = subtitle;
  }
  if (budget) {
    movie.budget = budget;
  }
  if (revenue) {
    movie.revenue = revenue;
  }
  if (runtime) {
    movie.runtime = runtime;
  }
  if (upc) {
    movie.upc = upc;
  }
  if (photo) {
    movie.photo = photo;
  }

  await movie.save();

  if (productionCompanies) {
    if (collectedProductionCompanies.length > 0) {
      await movie.setProductionCompanies(
        collectedProductionCompanies.map(
          (productionCompany) => productionCompany.id
        )
      );
    } else {
      await movie.setProductionCompanies([]);
    }

    movie.setDataValue(
      "productionCompanies",
      await movie.getProductionCompanies()
    );
  }

  if (genres) {
    if (collectedGenres.length > 0) {
      await movie.setMovieGenres(collectedGenres.map((genre) => genre.id));
    } else {
      await movie.setMovieGenres([]);
    }

    movie.setDataValue("movieGenres", await movie.getMovieGenres());
  }

  res.json(movie);
});

// Delete a movie by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findByPk(id);

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // Retrieve associated genres and movie instances in parallel
  const associatedMovieInstances = await MovieInstance.findAll({
    where: { movieId: id },
  });

  // Check if any movie instances reference the movie
  if (associatedMovieInstances && associatedMovieInstances.length) {
    return res.status(400).json({
      error: "Cannot delete movie as there are associated movie instances",
    });
  }

  await movie.destroy();

  res.json({ message: "Movie deleted successfully" });
});
