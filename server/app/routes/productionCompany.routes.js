module.exports = (app) => {
  const productionCompanies = require("../controllers/productionCompany.controller.js");

  var router = require("express").Router();

  // Create a new Production company
  router.post("/", productionCompanies.create);

  // Retrieve all Production companies
  router.get("/", productionCompanies.findAll);

  // Retrieve a single Production company with id or name
  router.get("/search", productionCompanies.search);

  // Retrieve a single Production company with id
  router.get("/:id", productionCompanies.findOne);

  // Update a Production company with id
  router.post("/:id/update", productionCompanies.update);

  // Delete a Production company with id
  router.post("/:id/delete", productionCompanies.delete);

  app.use("/api/productionCompany", router);
};
