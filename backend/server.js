require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = Number(process.env.PORT) || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] Connected to MySQL successfully');

    // In Phase 3+ we add models; sync is safe even with zero models.
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('[db] Models synced');

    app.listen(PORT, () => {
      console.log(`[server] SpaceSync API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[fatal] Failed to start server:', err.message);
    process.exit(1);
  }
})();
