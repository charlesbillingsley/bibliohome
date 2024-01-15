module.exports = app => {
    const movieinstances = require("../controllers/movieinstance.controller.js");

    var router = require("express").Router();

    // Create a new MovieInstance
    router.post("/", movieinstances.create);

    // Retrieve all MovieInstances
    router.get("/", movieinstances.findAll);

    // Retrieve MovieInstances with id or library id
    router.get("/search", movieinstances.search);

    // Retrieve a single MovieInstance with id
    router.get("/:id", movieinstances.findOne);

    // Update a MovieInstance with id
    router.post("/:id/update", movieinstances.update);

    // Delete a MovieInstance with id
    router.post("/:id/delete", movieinstances.delete);

    app.use('/api/movieinstance', router);
};
