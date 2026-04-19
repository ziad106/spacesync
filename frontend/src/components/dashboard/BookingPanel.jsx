import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function BookingPanel({ resource, bookings, onClose, onBook }) {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isPast = date && date < today;
  const conflicts = date ? bookings.filter(b => b.resource_id === resource.id && b.booking_date === date) : [];
  const canSubmit = date && !isPast && !conflicts.length && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await onBook({ resource_id: resource.id, booking_date: date });
      onClose();
    } catch { /* error handled by parent via toast */ }
    setLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed right-0 top-0 h-full w-[420px] z-[90] bg-surface-container-low border-l border-outline-variant/20 flex flex-col shadow-2xl"
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/20">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest mb-1">Allocation Terminal</p>
            <h2 className="text-lg font-semibold text-on-surface leading-tight">{resource.name}</h2>
            <p className="text-xs text-on-surface-variant/50 mt-0.5">{resource.type} · capacity {resource.capacity}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors mt-0.5">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-2">Operator</label>
            <div className="flex items-center gap-2 px-0 py-2 border-b border-outline/20">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">person</span>
              <span className="text-sm text-on-surface/60">{user?.name}</span>
              <span className="ml-auto text-[10px] font-mono text-on-surface-variant/30">{user?.role}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-2">Temporal Frame</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-on-surface-variant/40">calendar_month</span>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface text-sm pl-6 py-2 transition-colors [color-scheme:dark]"
              />
            </div>
            <AnimatePresence>
              {isPast && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-primary/80 font-mono mt-1.5">
                  Cannot allocate to a past temporal frame
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {date && !isPast && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-2">Conflict Radar</p>
                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3">
                  {conflicts.length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-tertiary">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Temporal frame clear — no conflicts detected
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-xs text-primary">
                      <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                      <div>
                        <p className="font-semibold">Conflict detected</p>
                        {conflicts.map(c => (
                          <p key={c.id} className="font-mono text-[10px] text-on-surface-variant/60 mt-0.5">
                            #{String(c.id).padStart(4,'0')} — {c.requested_by}
                          </p>
                        ))}
                        <p className="text-primary/60 mt-1">Choose another date</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-outline/30 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
              Abort
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60 animate-pulse" />
                    Confirming
                  </span>
                : 'Confirm Allocation'}
            </motion.button>
          </div>
        </form>
      </motion.aside>
    </>
  );
}
