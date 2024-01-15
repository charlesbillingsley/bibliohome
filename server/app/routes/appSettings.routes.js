module.exports = app => {
    const appSettings = require("../controllers/appSettings.controller.js");

    var router = require("express").Router();

    // Create a new settings entry
    router.post("/", appSettings.create);

    // Retrieve a single settings enrty with id
    router.get("/:id", appSettings.findOne);

    // Update a settings entry with id
    router.post("/:id/update", appSettings.update);

    // Delete a settings entry with id
    router.post("/:id/delete", appSettings.delete);

    app.use('/api/appSettings', router);
};
