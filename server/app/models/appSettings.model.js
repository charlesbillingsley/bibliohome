module.exports = (sequelize, Sequelize) => {
  const AppSettings = sequelize.define("AppSettings", {
    emailService: {
      type: Sequelize.STRING,
    },
    emailUsername: {
      type: Sequelize.STRING,
    },
    emailPassKey: {
      type: Sequelize.STRING,
    },
    movieApiKey: {
      type: Sequelize.STRING,
    },
  });

  // Virtual for user's URL
  AppSettings.prototype.getUrl = function () {
    return `/appSettings/${this.id}`;
  };

  return AppSettings;
};
