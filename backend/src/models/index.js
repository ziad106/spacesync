const sequelize = require('../config/db');

const Resource = require('./resource.model')(sequelize);
const Booking = require('./booking.model')(sequelize);

// Associations: One-to-Many (Resource -> Bookings)
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

const models = { Resource, Booking };

module.exports = { sequelize, models, Resource, Booking };
