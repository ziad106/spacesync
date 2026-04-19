import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CalendarDays } from 'lucide-react';

export default function BookingModal({ resource, onClose, onBook }) {
  const [form, setForm] = useState({ requested_by: '', booking_date: '' });
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isPast = form.booking_date !== '' && form.booking_date < today;
  const canSubmit = form.requested_by.trim() && form.booking_date && !isPast && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await onBook({ resource_id: resource.id, ...form });
      onClose();
    } catch {
      // error toast shown by parent
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {resource && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-[400px] z-50 bg-panel border-l border-line flex flex-col shadow-2xl"
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-line">
              <div>
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-0.5">New Booking</p>
                <h2 className="text-sm font-semibold text-primary">{resource.name}</h2>
                <p className="text-[11px] text-muted mt-0.5">{resource.type} · {resource.capacity} capacity</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-elevated text-muted hover:text-primary transition-colors mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 gap-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Requested By</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                  <input
                    type="text"
                    value={form.requested_by}
                    onChange={e => setForm(f => ({ ...f, requested_by: e.target.value }))}
                    placeholder="e.g. Dr. Ali"
                    className="w-full bg-elevated border border-line rounded-md pl-9 pr-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Booking Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                  <input
                    type="date"
                    value={form.booking_date}
                    onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))}
                    className="w-full bg-elevated border border-line rounded-md pl-9 pr-3 py-2 text-sm text-primary focus:outline-none focus:border-cyan-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
                <AnimatePresence>
                  {isPast && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-amber-400 text-xs mt-1.5 font-mono"
                    >
                      Cannot book in the past
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-md border border-line text-sm text-muted hover:text-primary hover:bg-elevated transition-all duration-150"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 py-2 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Confirming
                      </span>
                    : 'Confirm Booking'}
                </motion.button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
