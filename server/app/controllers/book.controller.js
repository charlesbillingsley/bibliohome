const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const Book = db.books;
const Author = db.authors;
const Genre = db.genres;
const User = db.users;
const BookInstance = db.bookInstances;
const Library = db.libraries;
const UserBook = db.userBooks;

// Create and save a new book
exports.create = asyncHandler(async (req, res) => {
  // Validate request body using express-validator
  await body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 1 })
    .run(req);
  await body("authors.*").run(req);
  await body("isbn10").trim().run(req);
  await body("isbn13").trim().run(req);
  await body("genres.*").run(req);
  await body("subtitle").trim().run(req);
  await body("description").trim().run(req);
  await body("photo").trim().run(req);
  await body("pageCount").trim().run(req);
  await body("binding").trim().run(req);
  await body("publisher").trim().run(req);
  await body("publishedDate")
    .trim()
    .isISO8601()
    .withMessage("Invalid published date. Must be in ISO 8601 format.")
    .optional({ nullable: true, checkFalsy: true })
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    authors,
    isbn10,
    isbn13,
    genres,
    subtitle,
    description,
    photo,
    pageCount,
    binding,
    publisher,
    publishedDate,
  } = req.body;

  // Check if the associated authors exist
  var collectedAuthors = [];
  for (const authorName of authors) {
    let firstName = "";
    let lastName = "";
    const nameParts = authorName.split(" ");

    if (nameParts.length > 1) {
      firstName = nameParts.slice(0, -1).join(" ");
      lastName = nameParts[nameParts.length - 1];
    } else {
      lastName = authorName;
    }

    const [author, authorCreated] = await Author.findOrCreate({
      where: { firstName, lastName },
    });

    collectedAuthors.push(author);
  }

  // Check if the associated genres exist
  var collectedGenres = [];
  for (const genrePath of genres) {
    const genreNames = genrePath.split(" / ");
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

  let book;
  try {
    // Create a new book instance
    book = await Book.create({
      title,
      isbn10,
      isbn13,
      subtitle,
      description,
      photo,
      pageCount,
      binding,
      publisher,
      publishedDate,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }

  if (collectedAuthors.length > 0) {
    await book.setAuthors(collectedAuthors.map((author) => author.id));
  }
  if (collectedGenres.length > 0) {
    await book.setBookGenres(collectedGenres.map((genre) => genre.id));
  }

  await book.setMediaType(1);

  res.status(201).json(book);
});

// Retrieve all books
exports.findAll = asyncHandler(async (req, res) => {
  const books = await Book.findAll({
    include: [
      { model: Author, as: "authors" },
      { model: Genre, as: "bookGenres" },
    ],
  });
  res.json(books);
});

// Search by id or isbn
exports.search = asyncHandler(async (req, res) => {
  const { id, isbn10, isbn13 } = req.query;

  let book;
  try {
    if (id) {
      book = await Book.findOne({
        where: { id },
        include: [
          { model: Author, as: "authors" },
          { model: Genre, as: "bookGenres" },
          {
            model: User,
            attributes: ["id"],
            as: "users",
            through: {
              model: UserBook,
              attributes: ["status"],
              as: 'userStatus'
            },
          },
        ],
      });
    } else if (isbn10) {
      book = await Book.findOne({
        where: { isbn10 },
        include: [
          { model: Author, as: "authors" },
          { model: Genre, as: "bookGenres" },
          {
            model: User,
            attributes: ["id"],
            as: "users",
            through: {
              model: UserBook,
              attributes: ["status"],
              as: 'userStatus'
            },
          },
        ],
      });
    } else if (isbn13) {
      book = await Book.findOne({
        where: { isbn13 },
        include: [
          { model: Author, as: "authors" },
          { model: Genre, as: "bookGenres" },
          {
            model: User,
            attributes: ["id"],
            as: "users",
            through: {
              model: UserBook,
              attributes: ["status"],
              as: 'userStatus'
            },
          },
        ],
      });
    } else {
      return res.json({});
    }
  } catch (error) {
    console.error("Error occurred during book search:", error);
    return res.status(500).json({
      error: "An error occurred during book search",
    });
  }

  if (!book) {
    return res.json({});
  }

  // Find libraries that have this book already
  try {
    const bookInstances = await BookInstance.findAll({
      where: { bookId: book.id },
      include: {
        model: Library,
        through: "libraryBookInstance",
      },
    });

    const libraryIds = bookInstances
      .map((instance) => instance.Libraries)
      .flat()
      .map((library) => library.id);

    const uniqueLibraries = [...new Set(libraryIds)];

    res.json({ book, libraries: uniqueLibraries });
  } catch (error) {
    console.error("Error occurred while retrieving book instances:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving book instances",
    });
  }
});

// Find a single book by ID
exports.findOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await Book.findByPk(id, {
    include: [
      { model: Author, as: "authors" },
      { model: Genre, as: "bookGenres" },
    ],
  });

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.json(book);
});

// Update a book by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate request body using express-validator
  await body("title").trim().run(req);
  await body("authors.*").run(req);
  await body("isbn10").trim().run(req);
  await body("isbn13").trim().run(req);
  await body("genres.*").run(req);
  await body("subtitle").trim().run(req);
  await body("description").trim().run(req);
  await body("photo").trim().run(req);
  await body("pageCount").trim().run(req);
  await body("binding").trim().run(req);
  await body("publisher").trim().run(req);
  await body("publishedDate")
    .trim()
    .isISO8601()
    .withMessage("Invalid published date. Must be in ISO 8601 format.")
    .optional({ nullable: true, checkFalsy: true })
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    authors,
    isbn10,
    isbn13,
    genres,
    subtitle,
    description,
    photo,
    pageCount,
    binding,
    publisher,
    publishedDate,
  } = req.body;

  const book = await Book.findByPk(id, {
    include: [
      { model: Author, as: "authors" },
      { model: Genre, as: "bookGenres" },
    ],
  });

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Check if the associated authors exist
  var collectedAuthors = [];
  if (authors) {
    for (const authorItem of authors) {
      let authorData = authorItem;

      if (typeof authorItem == "string") {
        let firstName = "";
        let lastName = "";
        let id = -1;
        const nameParts = authorItem.split(" ");

        if (nameParts.length > 1) {
          firstName = nameParts.slice(0, -1).join(" ");
          lastName = nameParts[nameParts.length - 1];
        } else {
          lastName = authorItem;
        }
        authorData = { id, firstName, lastName };
      }

      let author = null;
      let authorCreated = false;
      if (authorData.id >= 0) {
        author = await Author.findByPk(authorData.id);
      } else {
        [author, authorCreated] = await Author.findOrCreate({
          where: {
            firstName: authorData.firstName,
            lastName: authorData.lastName,
          },
        });
      }

      if (author) {
        collectedAuthors.push(author);
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

  // Update the book's properties
  if (title) {
    book.title = title;
  }
  if (isbn10) {
    book.isbn10 = isbn10;
  }
  if (isbn13) {
    book.isbn13 = isbn13;
  }
  if (subtitle) {
    book.subtitle = subtitle;
  }
  if (description) {
    book.description = description;
  }
  if (photo) {
    book.photo = photo;
  }
  if (pageCount) {
    book.pageCount = pageCount;
  }
  if (binding) {
    book.binding = binding;
  }
  if (publisher) {
    book.publisher = publisher;
  }
  if (publishedDate) {
    book.publishedDate = publishedDate;
  }

  await book.save();

  // Set the authors and genres for the book
  if (authors) {
    if (collectedAuthors.length > 0) {
      await book.setAuthors(collectedAuthors.map((author) => author.id));
    } else {
      await book.setAuthors([]);
    }

    book.setDataValue("authors", await book.getAuthors());
  }

  if (genres) {
    if (collectedGenres.length > 0) {
      await book.setBookGenres(collectedGenres.map((genre) => genre.id));
    } else {
      await book.setBookGenres([]);
    }

    book.setDataValue("bookGenres", await book.getBookGenres());
  }

  res.json(book);
});

// Update the user status of a book
exports.updateStatus = asyncHandler(async (req, res) => {
  const { bookId, userId, status } = req.body;

  let userBook = await UserBook.findOne({
    where: { bookId, userId },
  });

  if (!userBook) {
    // Create a new UserBook entry if it doesn't exist
    userBook = await UserBook.create({
      bookId,
      userId,
      status,
    });
  } else {
    // Update the status of the existing UserBook entry
    userBook.status = status;
    await userBook.save();
  }

  res.json(userBook);
});

// Delete a book by ID
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await Book.findByPk(id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Check if any book instances reference the book
  const associatedBookInstances = await BookInstance.findAll({
    where: { bookId: id },
  });

  if (associatedBookInstances && associatedBookInstances.length) {
    const bookInstanceIds = associatedBookInstances.map(
      (instance) => instance.id
    );
    return res.status(400).json({
      error:
        "Cannot delete book as there are associated book instances: " +
        bookInstanceIds.join(", "),
    });
  }

  await book.destroy();

  res.json({ message: "Book deleted successfully" });
});
