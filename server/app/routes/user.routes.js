module.exports = app => {
    const users = require("../controllers/user.controller.js");

    var router = require("express").Router();

    // Create a new User
    router.post("/", users.create);

    // Retrieve all Users
    router.get("/", users.findAll);

    // Retrieve a single User with id
    router.get("/:id", users.findOne);

    // Update a User with id
    router.post("/:id/update", users.update);

    // Delete a User with id
    router.post("/:id/delete", users.delete);

    // Login
    router.post("/login", users.login);

    // Send password over email
    router.post("/resetPassword", users.resetPassword);

    app.use('/api/user', router);
};
