const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EarlyRelease = sequelize.define(
    'EarlyRelease',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      booking_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      reporter_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      released_at: {
        // HH:MM:SS wall-clock time at which the room was freed
        type: DataTypes.TIME,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      points_awarded: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 10,
      },
    },
    {
      tableName: 'early_releases',
      underscored: true,
      indexes: [{ unique: true, fields: ['booking_id'] }],
    }
  );
  return EarlyRelease;
};
