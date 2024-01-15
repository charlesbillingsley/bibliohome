module.exports = (sequelize, Sequelize) => {
    const MediaType = sequelize.define("MediaType", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Required"
                },
                len: {
                    args:[3,100],
                    msg: "String length is not in this range"
                }
            }
        }
    });

    return MediaType;
};