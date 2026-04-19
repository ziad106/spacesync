import { motion } from 'framer-motion';

export default function StatsStrip({ resources, bookings }) {
  const today = new Date().toISOString().split('T')[0];
  const tiles = [
    { label: 'Total Resources',  value: resources.length },
    { label: 'Active Bookings',  value: bookings.length },
    { label: 'Bookings Today',   value: bookings.filter(b => b.booking_date === today).length },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className="bg-panel border border-line rounded-md px-4 py-3"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">{t.label}</p>
          <p className="text-2xl font-mono font-semibold text-primary">{t.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
