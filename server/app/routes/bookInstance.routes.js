module.exports = app => {
    const bookInstances = require("../controllers/bookInstance.controller.js");

    var router = require("express").Router();

    // Create a new BookInstance
    router.post("/", bookInstances.create);

    // Retrieve all BookInstances
    router.get("/", bookInstances.findAll);

    // Retrieve BookInstances with id or library id
    router.get("/search", bookInstances.search);

    // Retrieve a single BookInstance with id
    router.get("/:id", bookInstances.findOne);

    // Update a BookInstance with id
    router.post("/:id/update", bookInstances.update);

    // Delete a BookInstance with id
    router.post("/:id/delete", bookInstances.delete);

    app.use('/api/bookInstance', router);
};
