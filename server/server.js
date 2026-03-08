const express = require("express");
const cors = require("cors");
const seedDatabase = require("./seed");

const resetDb = false;

const app = express();

var corsOptions = {
  origin: [
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://192.168.86.60:3002",
    "http://bibliohome.charmanda.casa:3002",
    "http://bibliohome.charmanda.casa"
  ],
  default: "http://localhost:3002"
};

app.use(cors(corsOptions));

// load the database
const db = require("./app/models");

// Wait for DB to be ready and then sync models
async function waitForDbAndSync(retries = 10, delayMs = 3000) {
  const sequelize = db.sequelize;
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established.');
      if (resetDb) {
        await sequelize.sync({ force: true });
      } else {
        // Use alter in development so model changes (like new columns) are applied
        await sequelize.sync({ alter: true });
      }
      console.log('Database sync successful.');
      // Seed the database
      seedDatabase();
      return;
    } catch (err) {
      console.log(`Database not ready yet (attempt ${i + 1}/${retries}). Retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error('Could not connect to the database after multiple attempts. Exiting.');
}

waitForDbAndSync();

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
require("./app/routes/series.routes")(app);

// set port, listen for requests
// Prefer explicit PORT env; otherwise use SERVER_DOCKER_PORT (set by docker-compose) or 3001
const PORT = process.env.PORT || process.env.SERVER_DOCKER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
