const Sequelize = require("sequelize");

// Read DB connection settings from environment variables so the app
// can be configured when running in Docker. Provide sensible defaults
// for local development.
const HOST = process.env.DB_HOST || "localhost"; // docker-compose sets this to 'db'
const USER = process.env.DB_USER || "root";
const PASSWORD = process.env.DB_PASSWORD || "123456";
const DB = process.env.DB_NAME || "bibliohome";
const DIALECT = process.env.DB_DIALECT || "mysql";
const PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

module.exports = {
    HOST,
    USER,
    PASSWORD,
    DB,
    dialect: DIALECT,
    port: PORT,
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
