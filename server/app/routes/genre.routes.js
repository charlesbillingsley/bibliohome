module.exports = app => {
    const genres = require("../controllers/genre.controller.js");

    var router = require("express").Router();

    // Create a new Genre
    router.post("/", genres.create);

    // Retrieve all Genres
    router.get("/", genres.findAll);

    // Retrieve a single Genre with id or name
    router.get("/search", genres.search);

    // Retrieve a single Genre with id
    router.get("/name/:name", genres.findOne);

    // Retrieve a single Genre with id
    router.get("/:id", genres.findOne);

    // Update a Genre with id
    router.post("/:id/update", genres.update);

    // Delete a Genre with id
    router.post("/:id/delete", genres.delete);

    app.use('/api/genre', router);
};
