module.exports = (sequelize, Sequelize) => {
    const ProductionCompany = sequelize.define("ProductionCompany", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        photo: {
          type: Sequelize.STRING,
        },
    });

    return ProductionCompany;
};
