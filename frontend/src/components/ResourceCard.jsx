import { motion } from 'framer-motion';
import { DoorOpen, Cpu, FlaskConical, Box, Users } from 'lucide-react';
import StatusDot from './StatusDot';

const TYPE_ICONS = { Room: DoorOpen, Equipment: Cpu, Lab: FlaskConical };

function TimelineBar({ resourceId, bookings }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="mt-4">
      <p className="text-[9px] uppercase tracking-widest text-muted mb-1.5">7-day window</p>
      <div className="flex gap-0.5 h-1">
        {days.map(day => {
          const booked = bookings.some(b => b.resource_id === resourceId && b.booking_date === day);
          return (
            <div
              key={day}
              title={day}
              className={`flex-1 rounded-sm transition-colors ${booked ? 'bg-amber-400' : 'bg-emerald-500/25'}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-muted/50 mt-1">
        <span>today</span><span>+6d</span>
      </div>
    </div>
  );
}

export default function ResourceCard({ resource, bookings, onBook, index }) {
  const Icon = TYPE_ICONS[resource.type] || Box;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className="bg-panel border border-line rounded-md p-4 hover:border-cyan-500/25 hover:bg-elevated transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-400" />
          <StatusDot resourceId={resource.id} bookings={bookings} />
        </div>
        <span className="text-[10px] font-mono text-muted bg-elevated border border-line px-1.5 py-0.5 rounded">
          {resource.type}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-primary mb-1">{resource.name}</h3>
      <div className="flex items-center gap-1.5 text-muted text-xs">
        <Users className="w-3 h-3" />
        <span className="font-mono">{resource.capacity}</span>
        <span>capacity</span>
      </div>

      <TimelineBar resourceId={resource.id} bookings={bookings} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onBook(resource)}
        className="mt-4 w-full py-1.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-150"
      >
        Book Now
      </motion.button>
    </motion.div>
  );
}
