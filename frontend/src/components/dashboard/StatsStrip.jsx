import { motion } from 'framer-motion';

export default function StatsStrip({ resources, bookings }) {
  const today = new Date().toISOString().split('T')[0];
  const tiles = [
    { label: 'Total Resources',  value: resources.length, icon: 'inventory_2',    color: 'text-primary' },
    { label: 'Active Bookings',  value: bookings.length,  icon: 'calendar_month', color: 'text-tertiary' },
    { label: 'Bookings Today',   value: bookings.filter(b => b.booking_date === today).length, icon: 'today', color: 'text-secondary' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50">{t.label}</p>
            <span className={`material-symbols-outlined text-[18px] ${t.color}/60`}>{t.icon}</span>
          </div>
          <p className={`text-3xl font-mono font-semibold ${t.color}`}>{String(t.value).padStart(2, '0')}</p>
        </motion.div>
      ))}
    </div>
  );
}
