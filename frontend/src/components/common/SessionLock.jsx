import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIMEOUT = 5 * 60 * 1000;

export default function SessionLock() {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let timer;
    const reset = () => {
      setLocked(false);
      clearTimeout(timer);
      timer = setTimeout(() => setLocked(true), TIMEOUT);
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, []);

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLocked(false)}
          className="fixed inset-0 z-[300] backdrop-blur-sm bg-background/70 flex items-center justify-center cursor-pointer"
        >
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-[48px] block mb-3"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 48" }}>lock</span>
            <p className="text-on-surface font-mono text-sm">Session paused</p>
            <p className="text-on-surface-variant text-xs mt-1">Click anywhere to resume</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
