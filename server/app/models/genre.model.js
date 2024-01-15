module.exports = (sequelize, Sequelize) => {
  const Genre = sequelize.define("Genre", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  // Virtual for genre's URL
  Genre.prototype.getUrl = function () {
    return `/catalog/genre/${this.id}`;
  };

  return Genre;
};
