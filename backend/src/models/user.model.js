const { DataTypes } = require('sequelize');

const ROLES = ['Student', 'Teacher', 'Staff', 'ClassRep'];

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: { msg: 'name is required' } },
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: 'email must be valid' } },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...ROLES),
        allowNull: false,
        defaultValue: 'Student',
      },
      department: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: 'CSE',
      },
      identifier: {
        // Student ID or Employee ID (optional)
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      reward_points: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      indexes: [{ unique: true, fields: ['email'] }],
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
      scopes: {
        withPassword: { attributes: {} },
      },
    }
  );

  User.ROLES = ROLES;
  return User;
};
