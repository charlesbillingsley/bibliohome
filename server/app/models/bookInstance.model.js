const db = require('../models');
const Book = db.books;
const User = db.users;
const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const BookInstance = sequelize.define("BookInstance", {
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "Maintenance",
            validate: {
                isIn: [["Available", "Maintenance", "Loaned", "Reserved"]]
            }
        },
        dueBack: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    // Virtual for bookinstance's URL
    BookInstance.prototype.getUrl = function () {
        return `/catalog/bookinstance/${this.id}`;
    };

    return BookInstance;
};
