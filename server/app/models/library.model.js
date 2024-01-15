module.exports = (sequelize, Sequelize) => {
    const Library = sequelize.define("Library", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        icon: {
            type: Sequelize.STRING,
            default: "MenuBookRounded"
        }
    });

    return Library;
};