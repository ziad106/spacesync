import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { getUser } from '../auth';

const TABS = [
  { value: 'Pending',  label: 'Pending',  icon: '⏳' },
  { value: 'Approved', label: 'Approved', icon: '✅' },
  { value: 'Rejected', label: 'Rejected', icon: '⛔' },
  { value: 'All',      label: 'All',      icon: '👥' },
];

const ROLE_CHIP = {
  Admin:    'chip-danger',
  Teacher:  'chip-primary',
  ClassRep: 'chip-accent',
  Staff:    'chip-primary',
  Student:  'chip',
};

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export default function AdminUsers() {
  const me = getUser();
  // Route-level guard (also enforced server-side).
  if (!me) return <Navigate to="/login" state={{ from: '/admin/users' }} replace />;
  if (me.role !== 'Admin') return <Navigate to="/" replace />;

  const [tab, setTab] = useState('Pending');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api.adminListUsers(tab === 'All' ? undefined : tab);
      setUsers(data);
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    // Count only within the current response — not ideal for "All" but cheap.
    const c = { Pending: 0, Approved: 0, Rejected: 0 };
    for (const u of users) c[u.status] = (c[u.status] || 0) + 1;
    return c;
  }, [users]);

  async function approve(u) {
    if (busyId) return;
    setBusyId(u.id);
    try {
      await api.adminApproveUser(u.id);
      toast.success(`${u.name} approved — they can now sign in`);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setBusyId(null); }
  }

  async function reject(u) {
    if (busyId) return;
    if (!window.confirm(`Reject ${u.name} (${u.email})?\n\nThey will not be able to sign in.`)) return;
    setBusyId(u.id);
    try {
      await api.adminRejectUser(u.id);
      toast.success(`${u.name} rejected`);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setBusyId(null); }
  }

  return (
    <section className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>
            Admin · User management
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1" style={{ color: 'var(--ink)' }}>
            User approvals
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            Approve or reject new sign-ups. Pending users cannot log in until approved.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors"
              style={
                active
                  ? { background: 'var(--primary)', color: 'var(--primary-ink)', borderColor: 'var(--primary)' }
                  : { background: 'var(--surface-alt)', color: 'var(--ink)', borderColor: 'var(--border)' }
              }
            >
              <span className="mr-1">{t.icon}</span>{t.label}
              {t.value !== 'All' && counts[t.value] > 0 && (
                <span className="ml-2 text-[11px] opacity-80">({counts[t.value]})</span>
              )}
            </button>
          );
        })}
      </div>

      {err && (
        <div className="card p-4 mb-4" style={{ color: 'var(--danger)', background: 'var(--danger-soft)', borderColor: 'transparent' }}>
          ⚠ {err}
        </div>
      )}

      {loading ? (
        <div className="card p-6 text-center text-sm" style={{ color: 'var(--ink-soft)' }}>Loading users…</div>
      ) : users.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-semibold" style={{ color: 'var(--ink)' }}>
            {tab === 'Pending' ? 'No pending approvals' : `No ${tab.toLowerCase()} users`}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
            {tab === 'Pending' ? 'New sign-ups will appear here for your review.' : ' '}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold" style={{ color: 'var(--ink)' }}>{u.name}</span>
                  <span className={`chip ${ROLE_CHIP[u.role] || 'chip'}`}>{u.role}</span>
                  <StatusChip status={u.status} />
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
                  📧 <span style={{ color: 'var(--ink)' }}>{u.email}</span>
                  {u.identifier && <> · 🎓 {u.identifier}</>}
                  {u.department && <> · 🏛️ {u.department}</>}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
                  Joined {fmtDate(u.created_at || u.createdAt)}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {u.role === 'Admin' ? (
                  <span className="text-xs italic" style={{ color: 'var(--ink-faint)' }}>
                    Admin accounts are managed via the seed script
                  </span>
                ) : (
                  <>
                    {u.status !== 'Approved' && (
                      <button
                        className="btn-primary text-xs !px-3 !py-1.5"
                        onClick={() => approve(u)}
                        disabled={busyId === u.id}
                      >
                        {busyId === u.id ? '…' : '✓ Approve'}
                      </button>
                    )}
                    {u.status !== 'Rejected' && (
                      <button
                        className="btn-danger text-xs !px-3 !py-1.5"
                        onClick={() => reject(u)}
                        disabled={busyId === u.id}
                      >
                        ✕ Reject
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusChip({ status }) {
  const map = {
    Pending:  { bg: 'var(--warn-soft)',   fg: 'var(--warn)',   icon: '⏳' },
    Approved: { bg: 'var(--ok-soft)',     fg: 'var(--ok)',     icon: '✅' },
    Rejected: { bg: 'var(--danger-soft)', fg: 'var(--danger)', icon: '⛔' },
  };
  const s = map[status] || map.Pending;
  return (
    <span className="badge" style={{ background: s.bg, color: s.fg }}>
      <span style={{ marginRight: 4 }}>{s.icon}</span>{status}
    </span>
  );
}
