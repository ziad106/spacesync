import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export default function Dashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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

  return (
    <section>
      <h1 className="text-2xl font-bold mb-1">Resource Dashboard</h1>
      <p className="text-slate-600 mb-6">
        {loading ? 'Loading…' : `${resources.length} resources available`}
      </p>
      {err && <div className="card p-4 text-red-700 bg-red-50 border-red-200">⚠ {err}</div>}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-36 bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{r.name}</h3>
                <span className={`badge ${r.type === 'Room' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {r.type}
                </span>
              </div>
              <div className="text-sm text-slate-600 mt-1">Capacity: <strong>{r.capacity}</strong></div>
              <button className="btn-primary w-full mt-4" disabled>
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-400 mt-6">Booking modal wired up in Phase 6.</p>
    </section>
  );
}
