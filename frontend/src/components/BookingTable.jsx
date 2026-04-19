import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User } from 'lucide-react';
import EmptyState from './EmptyState';

const fmtId = (id) => `#BK-${String(id).padStart(4, '0')}`;

export default function BookingTable({ bookings, onCancel }) {
  if (!bookings.length) return <EmptyState />;

  return (
    <div className="bg-panel border border-line rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {['ID', 'Resource', 'Requested By', 'Date', 'Status', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {bookings.map((b, i) => (
              <motion.tr
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="border-b border-line/40 hover:bg-elevated/50 transition-colors last:border-0"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-muted">{fmtId(b.id)}</span>
                </td>
                <td className="px-4 py-3 font-medium text-primary">{b.Resource?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-muted text-xs">
                    <User className="w-3 h-3 shrink-0" />
                    {b.requested_by}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-muted">{b.booking_date}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-emerald-500/30 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {b.status ?? 'Confirmed'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onCancel(b.id)}
                    className="p-1.5 rounded-md text-muted hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-150"
                    title="Cancel booking"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
