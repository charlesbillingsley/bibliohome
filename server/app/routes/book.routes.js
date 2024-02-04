module.exports = app => {
    const books = require("../controllers/book.controller.js");

    var router = require("express").Router();

    // Create a new Book
    router.post("/", books.create);

    // Retrieve all Books
    router.get("/", books.findAll);

    // Retrieve a single Book with id, isbn10, or isbn13
    router.get("/search", books.search);

    // Retrieve a single Book with id
    router.get("/:id", books.findOne);

    // Update a Book with id
    router.post("/:id/update", books.update);

    // Update a Book with id
    router.post("/:id/updateStatus", books.updateStatus);

    // Update a Book with id
    router.post("/:id/updateDateRead", books.updateDateRead);

    // Delete a Book with id
    router.post("/:id/delete", books.delete);

    app.use('/api/book', router);
};
