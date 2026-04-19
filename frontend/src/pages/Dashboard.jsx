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
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8 text-white shadow-lg"
           style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #059669 100%)' }}>
        <div className="relative z-10 max-w-2xl">
          <p className="text-brand-100 text-xs uppercase tracking-widest font-semibold">Jahangirnagar University · CSE</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Book a Room or Equipment</h1>
          <p className="text-brand-50/90 mt-2 text-sm sm:text-base">
            Reserve classrooms, labs, libraries, and shared equipment in seconds.
            Every booking is instantly visible to the whole department.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" />
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
          {visible.map((r) => (
            <div key={r.id} className="resource-card">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl grid place-items-center">
                  {iconFor(r)}
                </div>
                <span className={`badge ${r.type === 'Room' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {r.type}
                </span>
              </div>
              <h3 className="font-bold text-lg mt-3 leading-tight">{r.name}</h3>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <span>👥</span> Capacity <strong className="text-slate-700">{r.capacity}</strong>
              </div>
              <button
                className="btn-primary w-full mt-5"
                onClick={() => setSelected(r)}
              >
                Book Now
              </button>
            </div>
          ))}
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
