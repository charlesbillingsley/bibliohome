
const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const MovieSeries = sequelize.define("MovieSeries", {
      orderNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  
    return MovieSeries;
  };
  