const sequelize = require('../config/db');

// Models will be registered in later phases. Keeping this as the single
// import point so controllers always pull models from here.
const models = {};

module.exports = { sequelize, models };
