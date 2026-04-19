import { useBookings } from '../hooks/useBookings';
import { useToast } from '../context/ToastContext';
import AmbientGlow from '../components/layout/AmbientGlow';
import BookingTable from '../components/bookings/BookingTable';

export default function Bookings() {
  const { bookings, loading, refetch, cancelBooking } = useBookings();
  const { addToast } = useToast();

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      addToast('Allocation cancelled', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Cannot cancel', 'error');
    }
  };

  return (
    <div className="p-6 relative min-h-screen">
      <AmbientGlow />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-headline font-bold text-primary tracking-[-0.02em]">Allocations</h1>
          <p className="text-sm text-on-surface-variant/60 mt-2">All active resource bookings</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 text-xs text-on-surface-variant/50 hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>
      {loading
        ? <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl h-48 animate-pulse" />
        : <BookingTable bookings={bookings} onCancel={handleCancel} />
      }
    </div>
  );
}
