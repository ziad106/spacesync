import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import BookingModal from '../components/BookingModal';
import { getUser, updateUser, isAuthed, canBook, whyCannotBook } from '../auth';

const UPCOMING_WINDOW_MIN = 30;

function pad(n) { return String(n).padStart(2, '0'); }

function nowParts() {
  const d = new Date();
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    minutes: d.getHours() * 60 + d.getMinutes(),
    label: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    dateLabel: d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
  };
}

function toMin(t) {
  if (typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtHM(t) {
  return typeof t === 'string' ? t.slice(0, 5) : '';
}

const PURPOSE_CHIP = {
  Class:   'chip-primary',
  Lab:     'chip-accent',
  Seminar: 'chip-primary',
  Meeting: 'chip-warn',
  Exam:    'chip-danger',
  Other:   'chip',
};

export default function Availability() {
  const nav = useNavigate();
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [now, setNow] = useState(nowParts());
  const [releasingId, setReleasingId] = useState(null);
  const [bookTarget, setBookTarget] = useState(null); // { resource, initialStart, initialEnd, initialDate }
  const mayBook = canBook();

  /** For a given room, compute the earliest non-conflicting 1-hour slot
   *  starting today, rounded up to the next :00 or :30 after "now". */
  function suggestSlot(resource) {
    const baseMin = Math.min(21 * 60, now.minutes + 5); // give 5-min buffer, cap at 21:00
    const startMin = Math.ceil(baseMin / 30) * 30;       // round up to :00 / :30
    const endMin = Math.min(22 * 60, startMin + 60);      // 1 h, cap at 22:00

    // Walk forward in 30-min steps until we find a slot that doesn't overlap
    // any existing booking for this resource today. Prevents the server 400.
    const todays = bookings.filter(
      (b) => b.resource_id === resource.id && b.booking_date === now.date
    );
    const overlaps = (s, e) =>
      todays.some((b) => s < toMin(b.end_time) && toMin(b.start_time) < e);

    let s = startMin;
    let e = endMin;
    for (let guard = 0; guard < 48 && overlaps(s, e); guard += 1) {
      s += 30;
      e = Math.min(22 * 60, s + 60);
      if (s >= 22 * 60) break;
    }
    const toHHMM = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    return { start: toHHMM(s), end: toHHMM(e) };
  }

  function handleBookFree(resource) {
    if (!isAuthed()) {
      toast('Sign in to book a resource', { icon: '🔒' });
      nav('/login', { state: { from: '/availability' } });
      return;
    }
    if (!mayBook) { toast.error(whyCannotBook()); return; }
    const { start, end } = suggestSlot(resource);
    setBookTarget({ resource, initialDate: now.date, initialStart: start, initialEnd: end });
  }

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [rs, bs] = await Promise.all([api.listResources(), api.listBookings()]);
      setResources(rs);
      setBookings(bs);
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Tick clock every 30s so states refresh automatically
  useEffect(() => {
    const id = setInterval(() => setNow(nowParts()), 30_000);
    return () => clearInterval(id);
  }, []);

  async function handleRelease(booking) {
    if (!isAuthed()) {
      toast('Sign in to earn reward points', { icon: '🔒' });
      nav('/login', { state: { from: '/availability' } });
      return;
    }
    const ok = window.confirm(
      `Mark "${booking.resource?.name}" as freed early?\n\n` +
      `${booking.purpose} by ${booking.requested_by} ended before ${fmtHM(booking.end_time)}.\n` +
      `You'll earn +10 reward points for helping your department.`
    );
    if (!ok) return;
    setReleasingId(booking.id);
    try {
      const res = await api.releaseBooking(booking.id);
      toast.success(`+${res.reward.points_awarded} pts! Total ${res.reward.total_points} 🎉`);
      // update cached user in localStorage so navbar reflects new points
      const cur = getUser();
      if (cur) updateUser({ ...cur, reward_points: res.reward.total_points });
      await load();
    } catch (e) {
      toast.error(e.message || 'Could not release room');
    } finally {
      setReleasingId(null);
    }
  }

  const { occupied, upcoming, free } = useMemo(() => {
    const rooms = resources.filter((r) => r.type === 'Room');
    const todays = bookings.filter((b) => b.booking_date === now.date);

    const ongoingByRoom = new Map(); // id -> booking
    const upcomingByRoom = new Map(); // id -> earliest upcoming booking in next 30 min

    for (const b of todays) {
      const s = toMin(b.start_time);
      const e = toMin(b.end_time);
      // A booking released early counts as over at released_at
      const effectiveEnd = b.early_release
        ? Math.min(e, toMin(b.early_release.released_at))
        : e;
      if (s <= now.minutes && now.minutes < effectiveEnd) {
        const existing = ongoingByRoom.get(b.resource_id);
        if (!existing || toMin(existing.start_time) < s) ongoingByRoom.set(b.resource_id, b);
      } else if (s > now.minutes && s - now.minutes <= UPCOMING_WINDOW_MIN) {
        const existing = upcomingByRoom.get(b.resource_id);
        if (!existing || toMin(existing.start_time) > s) upcomingByRoom.set(b.resource_id, b);
      }
    }

    const occupied = [];
    const upcoming = [];
    const free = [];

    for (const r of rooms) {
      const on = ongoingByRoom.get(r.id);
      const up = upcomingByRoom.get(r.id);
      if (on) {
        occupied.push({ resource: r, booking: on, nextBooking: up });
      } else if (up) {
        upcoming.push({ resource: r, booking: up });
      } else {
        free.push({ resource: r });
      }
    }

    return { occupied, upcoming, free };
  }, [resources, bookings, now]);

  return (
    <section className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>
            Live Availability
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1" style={{ color: 'var(--ink)' }}>
            Right Now
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {now.dateLabel} · {now.label} · Auto-refreshes every 30s
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading} aria-label="Refresh">
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Occupied" value={occupied.length} tone="busy" />
        <StatTile label="Starting soon" value={upcoming.length} tone="warn" hint={`within ${UPCOMING_WINDOW_MIN} min`} />
        <StatTile label="Free now" value={free.length} tone="ok" />
      </div>

      {err && (
        <div className="card p-4 mb-4" style={{ color: 'var(--danger)', background: 'var(--danger-soft)', borderColor: 'transparent' }}>
          ⚠ {err}
        </div>
      )}

      {/* Occupied */}
      <Section title="Occupied now" count={occupied.length} dotClass="busy" emptyText="No rooms are currently in use.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {occupied.map(({ resource, booking, nextBooking }) => (
            <OccupiedCard
              key={resource.id}
              resource={resource}
              booking={booking}
              nextBooking={nextBooking}
              nowMin={now.minutes}
              onRelease={handleRelease}
              releasing={releasingId === booking.id}
            />
          ))}
        </div>
      </Section>

      {/* Upcoming */}
      <Section title={`Occupied within ${UPCOMING_WINDOW_MIN} min`} count={upcoming.length} dotClass="warn" emptyText="No upcoming bookings in the next 30 minutes.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.map(({ resource, booking }) => (
            <UpcomingCard key={resource.id} resource={resource} booking={booking} nowMin={now.minutes} />
          ))}
        </div>
      </Section>

      {/* Free */}
      <Section title="Free right now" count={free.length} dotClass="ok" emptyText="No rooms are free at this moment.">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {free.map(({ resource }) => (
            <FreeCard
              key={resource.id}
              resource={resource}
              onBook={() => handleBookFree(resource)}
              mayBook={mayBook}
            />
          ))}
        </div>
      </Section>

      {bookTarget && (
        <BookingModal
          resource={bookTarget.resource}
          initialDate={bookTarget.initialDate}
          initialStart={bookTarget.initialStart}
          initialEnd={bookTarget.initialEnd}
          onClose={() => setBookTarget(null)}
          onCreated={() => { setBookTarget(null); load(); }}
        />
      )}
    </section>
  );
}

function StatTile({ label, value, tone, hint }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>
          {label}
        </span>
        <span className={`status-dot ${tone}`} />
      </div>
      <div className="text-3xl font-black mt-1" style={{ color: 'var(--ink)' }}>{value}</div>
      {hint && <div className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>{hint}</div>}
    </div>
  );
}

function Section({ title, count, dotClass, emptyText, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className={`status-dot ${dotClass}`} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{title}</h2>
        <span className="text-sm font-semibold" style={{ color: 'var(--ink-faint)' }}>· {count}</span>
      </div>
      {count === 0 ? (
        <div className="card p-6 text-sm" style={{ color: 'var(--ink-faint)' }}>{emptyText}</div>
      ) : children}
    </div>
  );
}

function OccupiedCard({ resource, booking, nextBooking, nowMin, onRelease, releasing }) {
  const endMin = toMin(booking.end_time);
  const freesIn = Math.max(0, endMin - nowMin);
  const purposeCls = PURPOSE_CHIP[booking.purpose] || 'chip';
  return (
    <div
      className="card p-4 relative overflow-hidden"
      style={{ borderLeft: '4px solid var(--danger)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base" style={{ color: 'var(--ink)' }}>{resource.name}</span>
            <span className={`chip ${purposeCls}`}>{booking.purpose}</span>
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            👤 <strong style={{ color: 'var(--ink)' }}>{booking.requested_by}</strong>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
            {fmtHM(booking.start_time)} – {fmtHM(booking.end_time)}
          </div>
        </div>
        <span className="badge" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
          <span className="status-dot busy" style={{ width: 6, height: 6, marginRight: 4, boxShadow: 'none' }} />
          IN USE
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 gap-3" style={{ borderTop: '1px dashed var(--border)' }}>
        <div className="text-xs min-w-0" style={{ color: 'var(--ink-soft)' }}>
          Frees in <strong style={{ color: 'var(--ink)' }}>{freesIn} min</strong>
          {nextBooking && (
            <span className="block truncate" style={{ color: 'var(--ink-faint)' }}>
              ↻ next: {nextBooking.purpose} at {fmtHM(nextBooking.start_time)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRelease?.(booking)}
          disabled={releasing}
          className="btn-accent text-xs !px-3 !py-1.5 whitespace-nowrap"
          title="Report that this room was freed early — earn +10 pts"
        >
          {releasing ? 'Releasing…' : '★ Release Early'}
        </button>
      </div>
    </div>
  );
}

function UpcomingCard({ resource, booking, nowMin }) {
  const startsIn = Math.max(0, toMin(booking.start_time) - nowMin);
  const purposeCls = PURPOSE_CHIP[booking.purpose] || 'chip';
  return (
    <div className="card p-4" style={{ borderLeft: '4px solid var(--warn)' }}>
      <div className="flex items-start justify-between">
        <span className="font-bold" style={{ color: 'var(--ink)' }}>{resource.name}</span>
        <span className="badge" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>
          STARTS IN {startsIn}m
        </span>
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
        👤 {booking.requested_by}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`chip ${purposeCls}`}>{booking.purpose}</span>
        <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>
          {fmtHM(booking.start_time)} – {fmtHM(booking.end_time)}
        </span>
      </div>
    </div>
  );
}

function FreeCard({ resource, onBook, mayBook }) {
  return (
    <div className="card p-4 flex flex-col" style={{ borderLeft: '4px solid var(--ok)' }}>
      <div className="flex items-start justify-between">
        <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{resource.name}</span>
        <span className="status-dot ok" />
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
        Capacity {resource.capacity}
      </div>
      <button
        type="button"
        onClick={onBook}
        title={mayBook ? `Book ${resource.name} now` : 'Sign in as Teacher / CR / Staff / Admin to book'}
        className="btn-primary text-xs !px-3 !py-1.5 mt-3 w-full"
        style={!mayBook ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
      >
        + Book this room
      </button>
    </div>
  );
}
