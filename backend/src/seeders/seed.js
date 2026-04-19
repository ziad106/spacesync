require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Resource, Booking, User } = require('../models');

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

    // Seed a few sample bookings only on --reset, centered around "right now"
    // so the Availability page has realistic live data on first launch.
    if (RESET) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const h = now.getHours();

      const hhmm = (hr, min = 0) => `${pad(hr)}:${pad(min)}:00`;
      const safe = Math.max(8, Math.min(17, h)); // keep times 08–17

      // Demo users — one per role. Default password for all: "password123".
      // Seeded BEFORE sample bookings so each booking can be linked to its owner.
      const hash = await bcrypt.hash('password123', 10);
      const demoUsers = [
        { name: 'Admin User',       email: 'admin@ju.edu',     role: 'Admin',     identifier: 'ADM-0001', reward_points: 0  },
        { name: 'Dr. Nasima Akter', email: 'teacher@ju.edu',   role: 'Teacher',   identifier: 'EMP-0001', reward_points: 30 },
        { name: 'Protik Saha',      email: 'student@ju.edu',   role: 'Student',   identifier: 'CSE-2021-042', reward_points: 45 },
        { name: 'CR Rakib',         email: 'cr@ju.edu',        role: 'ClassRep',  identifier: 'CSE-2021-007', reward_points: 70 },
        { name: 'Office Staff',     email: 'staff@ju.edu',     role: 'Staff',     identifier: 'STF-0012',  reward_points: 15 },
      ];
      const createdUsers = {};
      for (const u of demoUsers) {
        // All seeded accounts are pre-approved so the demo is usable out of
        // the box. New real signups via /api/auth/register will be Pending.
        const row = await User.create({
          ...u,
          password_hash: hash,
          department: 'CSE',
          status: 'Approved',
        });
        createdUsers[u.email] = row;
      }
      console.log(`[seed] Inserted ${demoUsers.length} demo users (password: "password123")`);

      const teacher  = createdUsers['teacher@ju.edu'];
      const classRep = createdUsers['cr@ju.edu'];
      const staff    = createdUsers['staff@ju.edu'];

      const rooms = await Resource.findAll({ where: { type: 'Room' } });
      const byName = Object.fromEntries(rooms.map((r) => [r.name, r.id]));

      const samples = [
        // Ongoing right now — owned by the Teacher demo account
        {
          name: 'Classroom 101',
          owner: teacher,
          start_time: hhmm(safe - 1, 0),
          end_time: hhmm(safe + 1, 0),
          purpose: 'Class',
        },
        // Ongoing — owned by the Class Rep
        {
          name: 'Computer Lab 201',
          owner: classRep,
          start_time: hhmm(safe, 0),
          end_time: hhmm(safe + 2, 0),
          purpose: 'Lab',
        },
        // Starting soon — owned by Staff
        {
          name: 'Seminar Room / Exam Room 202',
          owner: staff,
          start_time: hhmm(safe, 30),
          end_time: hhmm(safe + 2, 0),
          purpose: 'Seminar',
        },
        // Later today — owned by Teacher again
        {
          name: 'Classroom 103',
          owner: teacher,
          start_time: hhmm(safe + 3, 0),
          end_time: hhmm(safe + 4, 0),
          purpose: 'Meeting',
        },
      ];

      let bookingsCreated = 0;
      for (const s of samples) {
        const rid = byName[s.name];
        if (!rid || !s.owner) continue;
        await Booking.create({
          resource_id: rid,
          user_id: s.owner.id,
          requested_by: s.owner.name,
          booking_date: today,
          start_time: s.start_time,
          end_time: s.end_time,
          purpose: s.purpose,
          status: 'Confirmed',
        });
        bookingsCreated += 1;
      }
      console.log(`[seed] Inserted ${bookingsCreated} sample bookings for today (${today})`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  }
})();
