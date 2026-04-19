const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Resource = require('./Resource');
const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  requested_by: { type: DataTypes.STRING, allowNull: false },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Confirmed' },
}, { tableName: 'bookings', timestamps: true });
Resource.hasMany(Booking, { foreignKey: 'resource_id', onDelete: 'CASCADE' });
Booking.belongsTo(Resource, { foreignKey: 'resource_id' });
module.exports = Booking;
