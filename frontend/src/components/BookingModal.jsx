import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { getUser } from '../auth';

function todayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const PURPOSES = ['Class', 'Lab', 'Seminar', 'Meeting', 'Exam', 'Other'];

export default function BookingModal({ resource, onClose, onCreated }) {
  const user = getUser();
  const requestedBy = user?.name || '';
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [purpose, setPurpose] = useState(resource.type === 'Equipment' ? 'Other' : 'Class');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const validate = () => {
    const e = {};
    if (!bookingDate) e.bookingDate = 'Please pick a date';
    else if (bookingDate < todayStr()) e.bookingDate = 'Date cannot be in the past';
    if (!startTime) e.startTime = 'Pick a start time';
    if (!endTime) e.endTime = 'Pick an end time';
    if (startTime && endTime && endTime <= startTime) e.endTime = 'End must be after start';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        resource_id: resource.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        purpose,
      });
      toast.success(`Booked "${resource.name}" · ${bookingDate} ${startTime}–${endTime}`);
      onCreated?.(booking);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm fade-in"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="modal-panel card w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="w-11 h-11 rounded-lg grid place-items-center text-lg"
            style={{
              background: resource.type === 'Room' ? 'var(--primary)' : 'var(--accent)',
              color: resource.type === 'Room' ? 'var(--primary-ink)' : 'var(--accent-ink)',
            }}
          >
            {resource.type === 'Room' ? '🏛' : '🔧'}
          </div>
          <div>
            <h2 id="booking-title" className="text-lg font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              Book Resource
            </h2>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
              {resource.name} · {resource.type} · capacity {resource.capacity}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
          <div>
            <label className="label">Requested By</label>
            <div
              ref={firstRef}
              tabIndex={-1}
              className="input flex items-center justify-between"
              style={{ background: 'var(--surface-alt)', cursor: 'not-allowed' }}
              title="This is taken from your account and cannot be changed."
            >
              <span style={{ color: 'var(--ink)' }}>
                <strong>{requestedBy}</strong>
              </span>
              {user?.role && (
                <span className="chip chip-primary">{user.role}</span>
              )}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--ink-faint)' }}>
              🔒 Booking will be recorded under your account.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="booking_date">Booking Date</label>
            <input
              id="booking_date"
              type="date"
              className={`input ${errors.bookingDate ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : ''}`}
              min={todayStr()}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              disabled={submitting}
            />
            {errors.bookingDate && <p className="text-xs text-rose-600 mt-1">{errors.bookingDate}</p>}
          </div>

          <div>
            <label className="label">Purpose</label>
            <div className="flex flex-wrap gap-1.5">
              {PURPOSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
                  style={
                    purpose === p
                      ? { background: 'var(--primary)', color: 'var(--primary-ink)', borderColor: 'var(--primary)' }
                      : { background: 'var(--surface-alt)', color: 'var(--ink-soft)', borderColor: 'var(--border)' }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="start_time">Start Time</label>
              <input
                id="start_time"
                type="time"
                className={`input ${errors.startTime ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : ''}`}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={submitting}
              />
              {errors.startTime && <p className="text-xs text-rose-600 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="label" htmlFor="end_time">End Time</label>
              <input
                id="end_time"
                type="time"
                className={`input ${errors.endTime ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : ''}`}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={submitting}
              />
              {errors.endTime && <p className="text-xs text-rose-600 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary min-w-[120px]" disabled={submitting}>
              {submitting ? (<><span className="spinner" /> Booking…</>) : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
