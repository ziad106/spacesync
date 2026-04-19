const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('spacesync', 'root', 'YOUR_PASSWORD', {
  host: 'localhost', dialect: 'mysql', logging: false,
});
module.exports = sequelize;
