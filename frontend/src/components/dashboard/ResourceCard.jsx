import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICON = { Room: 'door_front', Equipment: 'memory', Lab: 'science' };

function roleBadgeLabel(allowed) {
  const roles = (allowed || 'admin,teacher,student').split(',').map(s => s.trim());
  if (roles.includes('student')) return 'ALL';
  if (roles.includes('teacher')) return 'TEACHER+';
  return 'ADMIN ONLY';
}

function TimelineBar({ resourceId, bookings }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  return (
    <div className="mt-4">
      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 mb-1.5">7-day window</p>
      <div className="flex gap-0.5 h-1">
        {days.map(day => {
          const booked = bookings.some(b => b.resource_id === resourceId && b.booking_date === day);
          return <div key={day} title={day} className={`flex-1 rounded-sm ${booked ? 'bg-primary/70' : 'bg-tertiary/20'}`} />;
        })}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-on-surface-variant/30 mt-1">
        <span>today</span><span>+6d</span>
      </div>
    </div>
  );
}

export default function ResourceCard({ resource, bookings, onBook, index }) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const bookedToday = bookings.some(b => b.resource_id === resource.id && b.booking_date === today);
  const allowedRoles = (resource.allowed_roles || 'admin,teacher,student').split(',').map(s => s.trim());
  const canBook = user?.role === 'admin' || allowedRoles.includes(user?.role);
  const icon = TYPE_ICON[resource.type] || 'inventory_2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 transition-all duration-200 ${
        canBook ? 'hover:border-primary/30 hover:bg-surface-container' : 'opacity-50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
          <span className={`w-2 h-2 rounded-full ${bookedToday ? 'bg-primary animate-pulse' : 'bg-tertiary animate-pulse'}`} title={bookedToday ? 'Booked today' : 'Available today'} />
        </div>
        <span className="text-[9px] font-mono uppercase tracking-wider text-tertiary bg-tertiary/10 border border-tertiary/30 px-2 py-0.5 rounded-full">
          {roleBadgeLabel(resource.allowed_roles)}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-on-surface mb-1">{resource.name}</h3>
      <div className="flex items-center gap-1.5 text-on-surface-variant/50 text-xs">
        <span className="material-symbols-outlined text-[14px]">group</span>
        <span className="font-mono">{resource.capacity}</span>
        <span>capacity · {resource.type}</span>
      </div>

      <TimelineBar resourceId={resource.id} bookings={bookings} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => canBook && onBook(resource)}
        disabled={!canBook}
        className="mt-4 w-full py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-primary-container text-on-primary disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        {canBook ? 'Initialize Allocation' : 'Access Restricted'}
      </motion.button>
    </motion.div>
  );
}
