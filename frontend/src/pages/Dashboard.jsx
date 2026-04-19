import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useResources } from '../hooks/useResources';
import { useBookings } from '../hooks/useBookings';
import { useToast } from '../context/ToastContext';
import AmbientGlow from '../components/layout/AmbientGlow';
import StatsStrip from '../components/dashboard/StatsStrip';
import ResourceGrid from '../components/dashboard/ResourceGrid';
import BookingPanel from '../components/dashboard/BookingPanel';
import CommandPalette from '../components/common/CommandPalette';

function AuditTicker({ bookings }) {
  if (!bookings.length) return null;
  const events = [...bookings].reverse().slice(0, 10).map(b => {
    const t = b.createdAt ? new Date(b.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';
    return `[${t}] ${b.requested_by} allocated ${b.Resource?.name ?? 'resource'}`;
  }).join('  ·  ');

  return (
    <div className="fixed bottom-0 left-72 right-0 h-8 bg-surface-container-lowest/90 border-t border-outline-variant/15 flex items-center overflow-hidden z-30 backdrop-blur-sm">
      <div className="whitespace-nowrap text-[10px] font-mono text-on-surface-variant/30 animate-ticker">
        {events}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{events}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { resources, loading: rLoading, refetch: refetchResources } = useResources();
  const { bookings, loading: bLoading, refetch: refetchBookings, createBooking, cancelBooking } = useBookings();
  const [selected, setSelected] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === 'Escape') { setCmdOpen(false); setSelected(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleBook = async (payload) => {
    await createBooking(payload);
    addToast('Allocation confirmed', 'success');
    await refetchBookings();
  };

  return (
    <div className="p-6 pb-12 relative min-h-screen">
      <AmbientGlow />
      <div className="mb-6">
        <h1 className="text-5xl font-headline font-bold text-primary tracking-[-0.02em]">Allocation Sanctum</h1>
        <p className="text-sm text-on-surface-variant/60 mt-2">Select a resource to initialize an allocation</p>
      </div>
      <StatsStrip resources={resources} bookings={bookings} />
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-mono">Available Resources</p>
        <span className="text-[10px] font-mono text-on-surface-variant/30 bg-surface-container border border-outline-variant/20 px-2 py-0.5 rounded">{resources.length} total</span>
      </div>
      <ResourceGrid resources={resources} bookings={bookings} loading={rLoading} onBook={setSelected} />
      <AuditTicker bookings={bookings} />

      <AnimatePresence>
        {selected && (
          <BookingPanel key="panel" resource={selected} bookings={bookings} onClose={() => setSelected(null)} onBook={handleBook} />
        )}
        {cmdOpen && (
          <CommandPalette key="cmd" onBook={(r) => { setSelected(r); setCmdOpen(false); }} onClose={() => setCmdOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
