import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StatusPill from './StatusPill';
import EmptyState from '../common/EmptyState';

const fmtId = (id) => `#BK-${String(id).padStart(4, '0')}`;

export default function BookingTable({ bookings, onCancel }) {
  const { user } = useAuth();
  if (!bookings.length) return <EmptyState message="No allocations logged" sub="Initialize a booking from the Dashboard" />;

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20">
            {['ID', 'Resource', 'Operator', 'Department', 'Date', 'Status', ''].map(h => (
              <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {bookings.map((b, i) => {
              const canCancel = user?.role === 'admin' || b.user_id === user?.id;
              return (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-on-surface-variant/50">{fmtId(b.id)}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-on-surface">{b.Resource?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-on-surface-variant/70 text-xs">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      {b.requested_by}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono text-on-surface-variant/40">{b.User?.department || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-on-surface-variant/60">{b.booking_date}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusPill status={b.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {canCancel && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onCancel(b.id)}
                        className="p-1.5 rounded-lg text-on-surface-variant/40 hover:text-error hover:bg-error-container/20 transition-all"
                        title="Cancel allocation"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
