const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Resource = sequelize.define('Resource', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'resources', timestamps: true });
module.exports = Resource;
