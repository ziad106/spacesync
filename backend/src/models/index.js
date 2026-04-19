const sequelize = require('../config/db');

const Resource = require('./resource.model')(sequelize);
const Booking = require('./booking.model')(sequelize);
const User = require('./user.model')(sequelize);
const EarlyRelease = require('./earlyRelease.model')(sequelize);

// Resource 1 —— n Booking
Resource.hasMany(Booking, {
  foreignKey: { name: 'resource_id', allowNull: false },
  as: 'bookings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Booking.belongsTo(Resource, {
  foreignKey: { name: 'resource_id', allowNull: false },
  as: 'resource',
});

// Booking 1 —— 1 EarlyRelease
Booking.hasOne(EarlyRelease, {
  foreignKey: { name: 'booking_id', allowNull: false },
  as: 'early_release',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
EarlyRelease.belongsTo(Booking, {
  foreignKey: { name: 'booking_id', allowNull: false },
  as: 'booking',
});

// User 1 —— n EarlyRelease
User.hasMany(EarlyRelease, {
  foreignKey: { name: 'reporter_id', allowNull: false },
  as: 'reports',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
EarlyRelease.belongsTo(User, {
  foreignKey: { name: 'reporter_id', allowNull: false },
  as: 'reporter',
});

const models = { Resource, Booking, User, EarlyRelease };

module.exports = { sequelize, models, Resource, Booking, User, EarlyRelease };
