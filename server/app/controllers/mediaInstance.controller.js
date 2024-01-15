const { body, validationResult } = require("express-validator");
const { Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const BookInstance = db.bookInstances;
const Book = db.books;
const MovieInstance = db.movieInstances;
const Movie = db.movies;
const User = db.users;
const Library = db.libraries;


// Retrieve all media instances
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
  const movieInstances = await MovieInstance.findAll({
    include: Movie,
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
  });

  // Combine bookInstances and movieInstances into one array
  const allInstances = [...bookInstances, ...movieInstances];

  res.json({ allInstances });
});

// Search by libraryId with pagination
exports.search = asyncHandler(async (req, res) => {
  let { libraryId, page = 1, pageSize = 10 } = req.query;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10)/2;

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
    console.error("Error occurred during media instance search:", error);
    return res.status(500).json({
      error: "An error occurred during media instance search",
    });
  }

  // Combine bookInstances and movieInstances into one array
  const allInstances = [...bookInstances.rows, ...movieInstances.rows];

  // Calculate the total count
  const totalCount = bookInstances.count + movieInstances.count;

  res.json({ count: totalCount, rows: allInstances });
});
