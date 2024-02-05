'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create junction table for books
    await queryInterface.createTable('BookSeries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderNumber: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // Add foreign key for book
      bookId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Books',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Add foreign key for series
      seriesId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Series',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create junction table for movies
    await queryInterface.createTable('MovieSeries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderNumber: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // Add foreign key for movie
      movieId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Movies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Add foreign key for series
      seriesId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Series',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop both tables in reverse order
    await queryInterface.dropTable('MovieSeries');
    await queryInterface.dropTable('BookSeries');
  },
};
