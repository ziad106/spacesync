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
      user_id: {
        // Owner of this booking — the user who created it. Nullable so legacy /
        // seeded rows without an account still work; only Admins can cancel those.
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
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
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      purpose: {
        type: DataTypes.ENUM('Class', 'Lab', 'Seminar', 'Meeting', 'Exam', 'Other'),
        allowNull: false,
        defaultValue: 'Class',
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
        { fields: ['resource_id', 'booking_date'], name: 'idx_resource_date' },
      ],
    }
  );

  return Booking;
};
