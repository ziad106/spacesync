require('dotenv').config();
const { sequelize, Resource, Booking } = require('../models');

// Actual resources of CSE Department, Jahangirnagar University
// NOTE: every room has a built-in projector + whiteboard; computer labs have 60+ PCs.
const SEED_DATA = [
  // Classrooms
  { name: 'Classroom 101', type: 'Room', capacity: 60,
    facilities: 'Projector, Whiteboard, AC, 60 seats' },
  { name: 'Classroom 102', type: 'Room', capacity: 60,
    facilities: 'Projector, Whiteboard, AC, 60 seats' },
  { name: 'Classroom 103', type: 'Room', capacity: 60,
    facilities: 'Projector, Whiteboard, AC, 60 seats' },
  // Specialized labs
  { name: 'Electric Circuit Lab 105', type: 'Room', capacity: 35,
    facilities: 'Projector, Whiteboard, Circuit kits, Oscilloscopes, AC' },
  { name: 'Computer Lab 201', type: 'Room', capacity: 60,
    facilities: 'Projector, Whiteboard, 60+ PCs, AC, LAN' },
  { name: 'Seminar Room / Exam Room 202', type: 'Room', capacity: 50,
    facilities: 'Projector, Whiteboard, Podium, AC, Sound system' },
  { name: 'Computer Lab 203', type: 'Room', capacity: 60,
    facilities: 'Projector, Whiteboard, 60+ PCs, AC, LAN' },
  { name: 'Seminar Library 205', type: 'Room', capacity: 30,
    facilities: 'Projector, Whiteboard, Books, Study tables, AC' },
  { name: 'Computer Lab 303', type: 'Room', capacity: 60,
    facilities: 'Projector, Whiteboard, 60+ PCs, AC, LAN' },
  // Shared portable equipment (not built-in to rooms)
  { name: 'Portable Smartboard', type: 'Equipment', capacity: 1,
    facilities: 'Wireless, HDMI + USB, Stylus included' },
  { name: 'Portable Sound System', type: 'Equipment', capacity: 1,
    facilities: '2 speakers + 2 mics, Bluetooth, Battery-powered' },
  { name: 'DSLR Camera Kit', type: 'Equipment', capacity: 1,
    facilities: 'Nikon D5600, Tripod, 2 lenses, 64GB SD' },
];

// Pass --reset to wipe bookings + resources before seeding
const RESET = process.argv.includes('--reset');

(async () => {
  try {
    await sequelize.authenticate();

    if (RESET) {
      // Drop and recreate all tables so schema changes apply cleanly
      await sequelize.sync({ force: true });
      console.log('[seed] Dropped and recreated all tables');
    } else {
      await sequelize.sync({ alter: true });
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
