module.exports = app => {
    const movies = require("../controllers/movie.controller.js");

    var router = require("express").Router();

    // Create a new Movie
    router.post("/", movies.create);

    // Retrieve all Movies
    router.get("/", movies.findAll);

    // Retrieve a single Movie with id or title
    router.get("/search", movies.search);

    // Retrieve a single Movie with id
    router.get("/:id", movies.findOne);

    // Update a Movie with id
    router.post("/:id/update", movies.update);

    // Delete a Movie with id
    router.post("/:id/delete", movies.delete);

    app.use('/api/movie', router);
};
