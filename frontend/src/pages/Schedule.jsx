import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

function formatDate(iso) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

function fmtTime(t) {
  // MySQL TIME returns HH:MM:SS; trim seconds
  return typeof t === 'string' ? t.slice(0, 5) : (t ?? '');
}

export default function Schedule() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null); // booking object
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api.listBookings();
      setBookings(data);
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) =>
      b.resource?.name?.toLowerCase().includes(q) ||
      b.requested_by?.toLowerCase().includes(q) ||
      b.booking_date?.toLowerCase().includes(q)
    );
  }, [bookings, query]);

  const confirmCancel = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeleting(true);
    try {
      await api.deleteBooking(id);
      setBookings((list) => list.filter((b) => b.id !== id));
      toast.success('Booking cancelled');
      setPendingDelete(null);
    } catch (e) {
      toast.error(e.message || 'Cancel failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>
            All Bookings
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1" style={{ color: 'var(--ink)' }}>Schedule</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {loading ? 'Loading bookings…' : `${visible.length} booking${visible.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              className="input pl-9 sm:w-72"
              placeholder="Search by resource, name, date…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="btn-ghost" onClick={load} disabled={loading} aria-label="Refresh">
            {loading ? '…' : '↻'}
          </button>
        </div>
      </div>

      {err && !loading && (
        <div className="card p-4 text-red-700 bg-red-50 border-red-200 mb-4">⚠ {err}</div>
      )}

      {loading ? (
        <div className="card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-slate-100 bg-slate-50/40 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="font-semibold text-slate-700">No bookings yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Go to the Dashboard and click <strong>Book Now</strong> on any resource.
          </p>
        </div>
      ) : (
        <>
          {/* Table (desktop) */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider"
                     style={{ background: 'var(--surface-alt)', color: 'var(--ink-soft)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-bold">Resource</th>
                  <th className="text-left px-4 py-3 font-bold">Purpose</th>
                  <th className="text-left px-4 py-3 font-bold">Requested By</th>
                  <th className="text-left px-4 py-3 font-bold">Date</th>
                  <th className="text-left px-4 py-3 font-bold">Time</th>
                  <th className="text-right px-4 py-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr key={b.id} className="transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="font-semibold" style={{ color: 'var(--ink)' }}>
                        {b.resource?.name || `#${b.resource_id}`}
                      </div>
                      <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                        {b.resource?.type || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip chip-primary">{b.purpose}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>{b.requested_by}</td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--ink-soft)' }}>
                      {formatDate(b.booking_date)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--primary)' }}>
                      {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="btn-danger text-xs !px-3 !py-1.5"
                        onClick={() => setPendingDelete(b)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card list (mobile) */}
          <div className="grid gap-3 md:hidden">
            {visible.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold" style={{ color: 'var(--ink)' }}>{b.resource?.name}</div>
                    <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                      {b.resource?.type}
                    </div>
                  </div>
                  <span className="chip chip-primary">{b.purpose}</span>
                </div>
                <div className="text-sm mt-3 space-y-1" style={{ color: 'var(--ink-soft)' }}>
                  <div>👤 <span style={{ color: 'var(--ink)' }}>{b.requested_by}</span></div>
                  <div>📅 {formatDate(b.booking_date)}</div>
                  <div className="font-semibold" style={{ color: 'var(--primary)' }}>
                    ⏰ {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                  </div>
                </div>
                <button
                  className="btn-danger w-full mt-3"
                  onClick={() => setPendingDelete(b)}
                >
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Cancel this booking?"
        message={
          pendingDelete
            ? `"${pendingDelete.resource?.name}" on ${formatDate(pendingDelete.booking_date)}, ${fmtTime(pendingDelete.start_time)}–${fmtTime(pendingDelete.end_time)} by ${pendingDelete.requested_by}`
            : ''
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep it"
        danger
        loading={deleting}
        onConfirm={confirmCancel}
        onCancel={() => !deleting && setPendingDelete(null)}
      />
    </section>
  );
}
