const Sequelize = require("sequelize");

module.exports = {
    HOST: "db",
    USER: "root",
    PASSWORD: "123456",
    DB: "bibliohome",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        defaultPrimaryKeyType: Sequelize.UUIDV4
    }
};
