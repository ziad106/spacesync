const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      resource_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      requested_by: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: { msg: 'requested_by is required' }, len: [2, 120] },
      },
      booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { isDate: { msg: 'booking_date must be a valid date (YYYY-MM-DD)' } },
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'Confirmed',
      },
    },
    {
      tableName: 'bookings',
      underscored: true,
      indexes: [
        { unique: true, fields: ['resource_id', 'booking_date'], name: 'uniq_resource_date' },
      ],
    }
  );

  return Booking;
};
