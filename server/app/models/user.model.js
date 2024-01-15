const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100],
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      set(value) {
        const hashedPassword = bcrypt.hashSync(value, 10);
        this.setDataValue("password", hashedPassword);
      },
    },
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    dateOfBirth: {
      type: Sequelize.DATE,
    },
    address: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.STRING,
    },
    photo: {
      type: Sequelize.STRING,
    },
  });

  // Virtual for user's full name
  User.prototype.getName = function () {
    let fullname = "";
    if (this.firstName && this.lastName) {
      fullname = `${this.lastName}, ${this.firstName}`;
    }
    if (!this.firstName || !this.lastName) {
      fullname = "";
    }
    return fullname;
  };

  // Virtual for user's URL
  User.prototype.getUrl = function () {
    return `/user/${this.id}`;
  };

  return User;
};
