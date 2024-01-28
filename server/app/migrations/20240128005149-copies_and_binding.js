"use strict";
const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "Books",
          "binding",
          { type: DataTypes.ENUM("", "paperback", "hardcover") },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "BookInstances",
          "numberOfCopies",
          { type: Sequelize.INTEGER, defaultValue: 0 },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("Books", "binding", { transaction: t }),
        queryInterface.removeColumn("BookInstances", "numberOfCopies", {
          transaction: t,
        }),
      ]);
    });
  },
};
