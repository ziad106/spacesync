import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Discover the backend port. The Express server writes its actual listening
 * port to `../backend/.runtime-port` after it binds, so we always proxy to the
 * right place — even when 5000 was busy and it fell through to 5001/5002/…
 *
 * Falls back to PORT env var, then 5000 if the file doesn't exist yet
 * (e.g. frontend started before backend). Users can restart `npm run dev`
 * once the backend is up to pick up the real port.
 */
function detectBackendPort() {
  const portFile = path.resolve(__dirname, '../backend/.runtime-port');
  try {
    const raw = fs.readFileSync(portFile, 'utf8').trim();
    const n = Number(raw);
    if (Number.isInteger(n) && n > 0) return n;
  } catch { /* file not there yet, use default */ }
  return Number(process.env.BACKEND_PORT) || 5000;
}

const backendPort = detectBackendPort();
// eslint-disable-next-line no-console
console.log(`[vite] Proxying /api -> http://localhost:${backendPort}`);

export default defineConfig({
  plugins: [react()],
  server: {
    // Preferred port; Vite auto-increments to the next free one if it's taken
    // (strictPort defaults to false, so 5173 → 5174 → 5175 → …).
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
});
