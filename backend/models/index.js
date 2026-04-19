const sequelize = require('../config/db');
const Resource = require('./Resource');
const Booking = require('./Booking');
const User = require('./User');

User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, Resource, Booking, User };
