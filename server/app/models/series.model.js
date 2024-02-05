module.exports = (sequelize, Sequelize) => {
  const Series = sequelize.define("Series", {
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
    description: {
      type: Sequelize.TEXT,
    },
    photo: {
      type: Sequelize.STRING,
    },
  });

  // Virtual for genre's URL
  Series.prototype.getUrl = function () {
    return `/catalog/series/${this.id}`;
  };

  return Series;
};
