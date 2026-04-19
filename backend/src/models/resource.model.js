const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Resource = sequelize.define(
    'Resource',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: { msg: 'name is required' }, len: [2, 120] },
      },
      type: {
        type: DataTypes.ENUM('Room', 'Equipment'),
        allowNull: false,
        validate: { isIn: { args: [['Room', 'Equipment']], msg: 'type must be Room or Equipment' } },
      },
      capacity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: { args: [1], msg: 'capacity must be >= 1' } },
      },
    },
    {
      tableName: 'resources',
      underscored: true,
    }
  );

  return Resource;
};
