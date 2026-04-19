const { Sequelize } = require('sequelize');
require('dotenv').config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'spacesync',
  DB_DIALECT = 'mysql',
  NODE_ENV = 'development',
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: DB_DIALECT,
  logging: NODE_ENV === 'development' ? (msg) => console.log(`[sql] ${msg}`) : false,
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
});

module.exports = sequelize;
