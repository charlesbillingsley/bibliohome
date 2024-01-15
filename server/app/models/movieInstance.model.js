const db = require('../models');
const Movie = db.movies;
const User = db.users;
const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const MovieInstance = sequelize.define("MovieInstance", {
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

    // Virtual for movieInstance's URL
    MovieInstance.prototype.getUrl = function() {
        return `/catalog/movieinstance/${this.id}`;
    };

    return MovieInstance;
};
