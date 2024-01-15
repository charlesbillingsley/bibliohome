module.exports = (sequelize, Sequelize) => {
  const Book = sequelize.define("Book", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isbn10: {
      type: Sequelize.STRING
    },
    isbn13: {
      type: Sequelize.STRING
    },
    subtitle: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    photo: {
      type: Sequelize.STRING,
    },
    pageCount: {
      type: Sequelize.INTEGER,
    },
    publisher: {
      type: Sequelize.STRING,
    },
    publishedDate: {
      type: Sequelize.DATE,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    }
  });

  // Virtual for book's URL
  Book.prototype.getUrl = function () {
    return `/catalog/book/${this.id}`;
  };

  return Book;
};
