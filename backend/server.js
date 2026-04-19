require('dotenv').config();

const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PREFERRED_PORT = Number(process.env.PORT) || 5000;
const MAX_ATTEMPTS = 20; // try 5000, 5001, …, 5019
const PORT_FILE = path.join(__dirname, '.runtime-port');

/** Try to listen on `port`. Resolves with the bound server, or rejects with
 *  an EADDRINUSE so the caller can try the next port. */
function tryListen(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.once('listening', () => resolve(server));
    server.once('error', (err) => reject(err));
  });
}

async function listenOnFreePort(preferred) {
  let lastErr;
  for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
    const port = preferred + i;
    try {
      const server = await tryListen(port);
      return { server, port };
    } catch (err) {
      if (err.code !== 'EADDRINUSE') throw err;
      lastErr = err;
      console.warn(`[server] Port ${port} in use, trying ${port + 1}…`);
    }
  }
  throw lastErr || new Error('No free port found');
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] Connected to MySQL successfully');

    // In Phase 3+ we add models; sync is safe even with zero models.
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('[db] Models synced');

    const { port } = await listenOnFreePort(PREFERRED_PORT);
    // Write the chosen port so the Vite dev server can auto-discover it.
    try {
      fs.writeFileSync(PORT_FILE, String(port), 'utf8');
    } catch (e) {
      console.warn('[server] Could not write .runtime-port file:', e.message);
    }
    console.log(`[server] SpaceSync API running on http://localhost:${port}`);

    // Clean up the port file on shutdown so stale values don't linger.
    const cleanup = () => {
      try { fs.unlinkSync(PORT_FILE); } catch { /* ignore */ }
      process.exit(0);
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (err) {
    console.error('[fatal] Failed to start server:', err.message);
    process.exit(1);
  }
})();
