const express = require("express");
const cors = require("cors");
const seedDatabase = require("./seed");

const resetDb = false;

const app = express();

var corsOptions = {
  origin: [
    "http://localhost:3000",
  ],
  default: "http://localhost:3000"
};

app.use(cors(corsOptions));

// load the database
const db = require("./app/models");

// Sync the models and create the tables
db.sequelize
  .sync({ force: resetDb })
  .then(() => {
    console.log("Database sync successful.");
    // Seed the database
    seedDatabase();
  })
  .catch((error) => {
    console.error("Error syncing the database:", error);
  });

// Drop tables in a specific order
// db.sequelize
//   .query("SET FOREIGN_KEY_CHECKS = 0")
//   .then(() => db.sequelize.sync({ force: true }))
//   .then(() => {
//     console.log("Tables dropped successfully.");

//     // Resync the tables in the correct order
//     return db.sequelize.sync();
//   })
//   .then(() => {
//     console.log("Tables re-synced successfully.");

//     // Seed the database
//     seedDatabase();
//   })
//   .catch((err) => {
//     console.error("Error dropping and re-syncing the tables:", err);
//   })
//   .finally(() => {
//     db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
//   });

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Bibliohome!" });
});

require("./app/routes/appSettings.routes")(app);
require("./app/routes/author.routes")(app);
require("./app/routes/book.routes")(app);
require("./app/routes/bookInstance.routes")(app);
require("./app/routes/genre.routes")(app);
require("./app/routes/library.routes")(app);
require("./app/routes/mediaInstance.routes")(app);
require("./app/routes/mediaType.routes")(app);
require("./app/routes/movie.routes")(app);
require("./app/routes/movieInstance.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/image.routes")(app);
require("./app/routes/productionCompany.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
