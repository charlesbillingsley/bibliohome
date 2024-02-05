
const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const BookSeries = sequelize.define("BookSeries", {
      orderNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  
    return BookSeries;
  };
  