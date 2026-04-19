const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('spacesync', 'root', 'mysql', {
  host: 'localhost', dialect: 'mysql', logging: false,
});
module.exports = sequelize;
