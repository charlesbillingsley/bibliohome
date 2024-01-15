const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },

  define: {
    timestamps: dbConfig.define.timestamps,
    defaultPrimaryKeyType: dbConfig.define.defaultPrimaryKeyType,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Bring in models
db.appSettings = require("./appSettings.model.js")(sequelize, Sequelize);
db.authors = require("./author.model.js")(sequelize, Sequelize);
db.books = require("./book.model.js")(sequelize, Sequelize);
db.bookInstances = require("./bookInstance.model.js")(sequelize, Sequelize);
db.genres = require("./genre.model.js")(sequelize, Sequelize);
db.libraries = require("./library.model.js")(sequelize, Sequelize);
db.mediaTypes = require("./mediaType.model.js")(sequelize, Sequelize);
db.movies = require("./movie.model.js")(sequelize, Sequelize);
db.movieInstances = require("./movieInstance.model.js")(sequelize, Sequelize);
db.productionCompanies = require("./productionCompany.model.js")(
  sequelize,
  Sequelize
);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.userBooks = require("./userBook.model.js")(sequelize, Sequelize);

// Set up associations
// --- MediaType
db.mediaTypes.hasMany(db.books, {
  foreignKey: "mediaTypeId",
});
db.mediaTypes.hasMany(db.movies, {
  foreignKey: "mediaTypeId",
});
db.mediaTypes.hasMany(db.bookInstances, {
  foreignKey: "mediaTypeId",
});
db.mediaTypes.hasMany(db.movieInstances, {
  foreignKey: "mediaTypeId",
});


// --- Book
db.books.belongsToMany(db.authors, {
  through: "bookAuthor",
  foreignKey: "bookId",
  as: "authors",
});
db.books.belongsToMany(db.genres, {
  through: "bookGenre",
  foreignKey: "bookId",
  as: "bookGenres",
});
db.books.belongsTo(db.mediaTypes, {
  foreignKey: "mediaTypeId",
});
db.bookInstances.belongsTo(db.books, {
  foreignKey: "bookId",
  allowNull: false,
});
db.bookInstances.belongsTo(db.mediaTypes, {
  foreignKey: "mediaTypeId",
});

// --- Movie
db.movies.belongsToMany(db.productionCompanies, {
    through: "movieProductionCompany",
    foreignKey: "movieId",
    as: "productionCompanies",
  });
db.movies.belongsToMany(db.genres, {
  through: "movieGenre",
  foreignKey: "movieId",
  as: "movieGenres",
});
db.movies.belongsTo(db.mediaTypes, {
  foreignKey: "mediaTypeId",
});
db.movieInstances.belongsTo(db.movies, {
  foreignKey: "movieId",
  allowNull: false,
});
db.movieInstances.belongsTo(db.mediaTypes, {
  foreignKey: "mediaTypeId",
});

// --- Library
db.libraries.belongsToMany(db.bookInstances, {
  through: "libraryBookInstance",
  foreignKey: "libraryId",
});
db.bookInstances.belongsToMany(db.libraries, {
  through: "libraryBookInstance",
  foreignKey: "bookInstanceId",
});
db.libraries.belongsToMany(db.movieInstances, {
  through: "libraryMovieInstance",
  foreignKey: "libraryId",
});
db.movieInstances.belongsToMany(db.libraries, {
  through: "libraryMovieInstance",
  foreignKey: "movieInstanceId",
});

// --- Author
db.authors.belongsToMany(db.books, {
  through: "bookAuthor",
  foreignKey: "authorId",
  as: "books",
});

// --- Genre
db.genres.belongsTo(db.genres, {
  foreignKey: "parentId",
  as: "parentGenre",
});
db.genres.hasMany(db.genres, {
  foreignKey: "parentId",
  as: "subgenres",
});
db.genres.belongsToMany(db.books, {
  through: "bookGenre",
  foreignKey: "genreId",
  as: "books",
});
db.genres.belongsToMany(db.movies, {
  through: "movieGenre",
  foreignKey: "genreId",
  as: "movies",
});

// --- Production Company
db.productionCompanies.belongsToMany(db.movies, {
  through: "movieProductionCompany",
  foreignKey: "productionCompanyId",
  as: "movies",
});

// --- User
db.users.belongsToMany(db.books, {
  through: db.userBooks,
  foreignKey: "userId",
  otherKey: "bookId",
  as: "books",
});
db.books.belongsToMany(db.users, {
  through: db.userBooks,
  foreignKey: "bookId",
  otherKey: "userId",
  as: "users",
});

module.exports = db;
