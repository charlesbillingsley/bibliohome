module.exports = (sequelize, Sequelize) => {
  const Movie = sequelize.define("Movie", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    releaseDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    subtitle: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    upc: {
      type: Sequelize.STRING,
    },
    runtime: {
      type: Sequelize.INTEGER,
    },
    budget: {
      type: Sequelize.INTEGER,
    },
    revenue: {
      type: Sequelize.INTEGER,
    },
    photo: {
      type: Sequelize.STRING,
    },
  });

  // Virtual for movie's URL
  Movie.prototype.getUrl = function () {
    return `/catalog/movie/${this.id}`;
  };

  return Movie;
};
