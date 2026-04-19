require('dotenv').config();
const { sequelize, Resource, Booking } = require('../models');

// Actual resources of CSE Department, Jahangirnagar University
const SEED_DATA = [
  // Classrooms
  { name: 'Classroom 101', type: 'Room', capacity: 60 },
  { name: 'Classroom 102', type: 'Room', capacity: 60 },
  { name: 'Classroom 103', type: 'Room', capacity: 60 },
  // Specialized labs
  { name: 'Electric Circuit Lab 105', type: 'Room', capacity: 35 },
  { name: 'Computer Lab 201', type: 'Room', capacity: 40 },
  { name: 'Seminar Room / Exam Room 202', type: 'Room', capacity: 50 },
  { name: 'Computer Lab 203', type: 'Room', capacity: 40 },
  { name: 'Seminar Library 205', type: 'Room', capacity: 30 },
  { name: 'Computer Lab 303', type: 'Room', capacity: 40 },
  // Shared equipment
  { name: 'Multimedia Projector', type: 'Equipment', capacity: 1 },
  { name: 'Portable Smartboard', type: 'Equipment', capacity: 1 },
];

// Pass --reset to wipe bookings + resources before seeding
const RESET = process.argv.includes('--reset');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    if (RESET) {
      await Booking.destroy({ where: {}, truncate: false });
      await Resource.destroy({ where: {}, truncate: false });
      console.log('[seed] Cleared existing resources and bookings');
    }

    let created = 0;
    for (const row of SEED_DATA) {
      const [, wasCreated] = await Resource.findOrCreate({
        where: { name: row.name },
        defaults: row,
      });
      if (wasCreated) created += 1;
    }

    const total = await Resource.count();
    console.log(`[seed] Inserted ${created} new resources. Total now: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  }
})();
