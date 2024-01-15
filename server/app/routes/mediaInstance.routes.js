module.exports = app => {
    const mediaInstances = require("../controllers/mediaInstance.controller.js");

    var router = require("express").Router();

    // Retrieve all mediaInstances
    router.get("/", mediaInstances.findAll);

    // Retrieve mediaInstances with id or library id
    router.get("/search", mediaInstances.search);

    app.use('/api/mediaInstance', router);
};
