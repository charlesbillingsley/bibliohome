module.exports = app => {
    const mediaTypes = require("../controllers/mediaType.controller.js");

    var router = require("express").Router();

    // Create a new MediaType
    router.post("/", mediaTypes.create);

    // Retrieve all MediaTypes
    router.get("/", mediaTypes.findAll);

    // Retrieve a single MediaType with id
    router.get("/:id", mediaTypes.findOne);

    // Update a MediaType with id
    router.post("/:id/update", mediaTypes.update);

    // Delete a MediaType with id
    router.post("/:id/delete", mediaTypes.delete);

    app.use('/api/mediatype', router);
};