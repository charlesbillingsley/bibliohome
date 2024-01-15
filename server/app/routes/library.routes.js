module.exports = app => {
    const libraries = require("../controllers/library.controller.js");

    var router = require("express").Router();

    // Create a new Library
    router.post("/", libraries.create);

    // Retrieve all Libraries
    router.get("/", libraries.findAll);

    // Retrieve a single Library with id
    router.get("/:id", libraries.findOne);

    // Update a Library with id
    router.post("/:id/update", libraries.update);

    // Delete a Library with id
    router.post("/:id/delete", libraries.delete);

    app.use('/api/library', router);
};