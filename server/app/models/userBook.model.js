
const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const UserBook = sequelize.define("UserBook", {
      status: {
        type: DataTypes.ENUM('unread', 'reading', 'read', 'abandoned'),
        defaultValue: 'unread'
      },
      dateRead: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });
  
    return UserBook;
  };
  