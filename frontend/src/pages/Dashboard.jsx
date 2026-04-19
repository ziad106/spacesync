import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import BookingModal from '../components/BookingModal';

function iconFor(resource) {
  const n = resource.name.toLowerCase();
  if (resource.type === 'Equipment') return n.includes('smart') ? '📺' : '📽️';
  if (n.includes('library')) return '📚';
  if (n.includes('computer') || n.includes('lab')) return '💻';
  if (n.includes('circuit') || n.includes('electric')) return '⚡';
  if (n.includes('seminar') || n.includes('exam')) return '🎓';
  return '🏛️';
}

export default function Dashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null); // resource being booked

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.listResources();
        if (alive) setResources(data);
      } catch (e) {
        if (alive) setErr(e.message);
        toast.error(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (filter !== 'All' && r.type !== filter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    });
  }, [resources, query, filter]);

  return (
    <section className="fade-in">
      {/* Hero (flat editorial) */}
      <div className="hero mb-8">
        <div className="relative z-10 max-w-2xl">
          <span className="hero-eyebrow">Jahangirnagar University · CSE</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 leading-[1.1]">
            Book a room.<br className="hidden sm:block" />
            <span style={{ color: 'var(--accent)' }}>See it live.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base max-w-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Reserve classrooms, labs and shared equipment. Track occupancy across the
            department in real time.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {resources.filter(r => r.type === 'Room').length} rooms
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {resources.filter(r => r.type === 'Equipment').length} equipment
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            className="input pl-9"
            placeholder="Search resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 rounded-lg p-1 w-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {['All', 'Room', 'Equipment'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors"
              style={
                filter === f
                  ? { background: 'var(--primary)', color: 'var(--primary-ink)' }
                  : { color: 'var(--ink-soft)', background: 'transparent' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {err && !loading && (
        <div className="card p-4 text-red-700 bg-red-50 border-red-200 mb-4">⚠ {err}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-44 bg-slate-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <div className="text-4xl mb-2">🔎</div>
          No resources match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r) => {
            const facilities = (r.facilities || '').split(',').map(s => s.trim()).filter(Boolean);
            return (
              <div key={r.id} className="resource-card pl-6" data-type={r.type}>
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 rounded-lg grid place-items-center text-xl"
                    style={{
                      background: r.type === 'Room' ? 'var(--primary-soft)' : 'var(--accent-soft)',
                      color: r.type === 'Room' ? 'var(--primary)' : 'var(--accent)',
                    }}
                  >
                    {iconFor(r)}
                  </div>
                  <span
                    className="badge uppercase"
                    style={
                      r.type === 'Room'
                        ? { background: 'var(--primary-soft)', color: 'var(--primary)' }
                        : { background: 'var(--accent-soft)', color: 'var(--accent)' }
                    }
                  >
                    {r.type}
                  </span>
                </div>
                <h3 className="font-bold text-base mt-3 leading-tight" style={{ color: 'var(--ink)' }}>
                  {r.name}
                </h3>
                <div className="text-xs mt-1 flex items-center gap-1.5" style={{ color: 'var(--ink-soft)' }}>
                  <span>👥</span> Capacity <strong style={{ color: 'var(--ink)' }}>{r.capacity}</strong>
                </div>
                {facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {facilities.slice(0, 4).map((f, i) => (
                      <span key={i} className="chip">{f}</span>
                    ))}
                    {facilities.length > 4 && (
                      <span className="chip">+{facilities.length - 4}</span>
                    )}
                  </div>
                )}
                <button className="btn btn-primary w-full mt-4" onClick={() => setSelected(r)}>
                  Book Now
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <BookingModal
          resource={selected}
          onClose={() => setSelected(null)}
          onCreated={() => { /* Schedule page re-fetches on mount */ }}
        />
      )}
    </section>
  );
}
