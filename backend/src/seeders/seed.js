require('dotenv').config();
const { sequelize, Resource } = require('../models');

const SEED_DATA = [
  { name: 'Networking Lab', type: 'Room', capacity: 40 },
  { name: 'Seminar Library', type: 'Room', capacity: 60 },
  { name: 'Multimedia Projector', type: 'Equipment', capacity: 1 },
  { name: 'AI Research Lab', type: 'Room', capacity: 30 },
  { name: 'Portable Smartboard', type: 'Equipment', capacity: 1 },
];

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

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
