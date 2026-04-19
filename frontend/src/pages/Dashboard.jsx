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
      {/* Hero */}
      <div className="hero mb-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-accent-200 text-xs uppercase tracking-[0.2em] font-bold">
            Jahangirnagar University · CSE
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-2 leading-tight">
            Book a room,<br className="hidden sm:block" />
            in seconds.
          </h1>
          <p className="text-indigo-100/90 mt-3 text-sm sm:text-base max-w-lg">
            Reserve classrooms, labs, libraries, and shared equipment — every booking is
            instantly visible to the whole department.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur border border-white/20">
              <span>🏛️</span> {resources.filter(r => r.type === 'Room').length} rooms
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur border border-white/20">
              <span>🔧</span> {resources.filter(r => r.type === 'Equipment').length} equipment
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-400/90 text-brand-900 border border-accent-300">
              <span>⚡</span> Live updates
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-16 w-80 h-80 rounded-full bg-accent-400/25 blur-3xl" />
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
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
          {['All', 'Room', 'Equipment'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === f ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
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
              <div key={r.id} className="resource-card">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl text-2xl grid place-items-center shadow-sm"
                       style={{ backgroundImage: 'linear-gradient(135deg, #e0e7ff 0%, #fef3c7 100%)' }}>
                    {iconFor(r)}
                  </div>
                  <span className={`badge ${r.type === 'Room' ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'}`}>
                    {r.type}
                  </span>
                </div>
                <h3 className="font-bold text-lg mt-3 leading-tight">{r.name}</h3>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>👥</span> Capacity <strong className="text-slate-700">{r.capacity}</strong>
                </div>
                {facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {facilities.slice(0, 4).map((f, i) => (
                      <span key={i} className="chip">{f}</span>
                    ))}
                    {facilities.length > 4 && (
                      <span className="chip bg-surface-100 text-slate-500 border-surface-200">
                        +{facilities.length - 4}
                      </span>
                    )}
                  </div>
                )}
                <button
                  className="btn-primary w-full mt-4"
                  onClick={() => setSelected(r)}
                >
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
