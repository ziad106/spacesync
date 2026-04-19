export default function StatusDot({ resourceId, bookings }) {
  const today = new Date().toISOString().split('T')[0];
  const bookedToday = bookings.some(b => b.resource_id === resourceId && b.booking_date === today);
  return (
    <span
      title={bookedToday ? 'Booked today' : 'Available today'}
      className={`w-2 h-2 rounded-full animate-pulse ${bookedToday ? 'bg-amber-400' : 'bg-emerald-400'}`}
    />
  );
}
