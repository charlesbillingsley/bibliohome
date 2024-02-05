module.exports = (app) => {
  const series = require("../controllers/series.controller.js");

  var router = require("express").Router();

  // Create a new Series
  router.post("/", series.create);

  // Retrieve all series
  router.get("/", series.findAll);

  // Retrieve a single series with id or name
  router.get("/search", series.search);

  // Retrieve a single series with id
  router.get("/:id", series.findOne);

  // Update a Series with id
  router.post("/:id/update", series.update);

  // Delete a series with id
  router.post("/:id/delete", series.delete);

  app.use("/api/series", router);
};
