module.exports = app => {
    const authors = require("../controllers/author.controller.js");

    var router = require("express").Router();

    // Create a new Author
    router.post("/", authors.create);

    // Retrieve all Authors
    router.get("/", authors.findAll);

    // Retrieve a single Author with id or first & last name
    router.get("/search", authors.search);

    // Retrieve a single Author with id
    router.get("/:id", authors.findOne);

    // Update a Author with id
    router.post("/:id/update", authors.update);

    // Delete a Author with id
    router.post("/:id/delete", authors.delete);

    app.use('/api/author', router);
};
