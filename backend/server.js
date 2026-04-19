const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const resourceRoutes = require('./routes/resourceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

sequelize.sync({ alter: true }).then(() => {
  console.log('DB synced');
  app.listen(5001, () => console.log('Server :5001'));
});
