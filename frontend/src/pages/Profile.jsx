import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { getUser, isAuthed, logout, updateUser } from '../auth';

const BADGES = [
  { min:   0, label: 'Newcomer',   icon: '🌱' },
  { min:  20, label: 'Contributor',icon: '🤝' },
  { min:  50, label: 'Helper',     icon: '🌟' },
  { min: 100, label: 'Champion',   icon: '🏆' },
  { min: 250, label: 'Legend',     icon: '👑' },
];

function currentBadge(points) {
  return [...BADGES].reverse().find((b) => points >= b.min) || BADGES[0];
}

function nextBadge(points) {
  return BADGES.find((b) => b.min > points);
}

export default function Profile() {
  const nav = useNavigate();
  const [user, setUser] = useState(getUser());
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, lb] = await Promise.all([api.me(), api.leaderboard()]);
      setUser(meRes.user);
      setStats(meRes.stats);
      updateUser(meRes.user);
      setBoard(lb);
    } catch (e) {
      toast.error(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthed()) { nav('/login', { replace: true }); return; }
    load();
  }, [load, nav]);

  if (!user) return null;

  const points = user.reward_points || 0;
  const badge = currentBadge(points);
  const next = nextBadge(points);
  const toNext = next ? next.min - points : 0;
  const progressPct = next
    ? Math.min(100, Math.round(((points - badge.min) / (next.min - badge.min)) * 100))
    : 100;

  return (
    <section className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>
            My Profile
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1" style={{ color: 'var(--ink)' }}>
            {user.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {user.role} · {user.department}
            {user.identifier ? ` · ${user.identifier}` : ''} · {user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={load} disabled={loading}>
            {loading ? '…' : '↻ Refresh'}
          </button>
          <button
            className="btn-danger"
            onClick={() => { logout(); toast.success('Logged out'); nav('/login', { replace: true }); }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Reward card */}
      <div className="card p-6 mb-6 relative overflow-hidden" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--ink-faint)' }}>
              Reward points
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black" style={{ color: 'var(--primary)' }}>{points}</span>
              <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>pts</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-2xl">{badge.icon}</span>
              <span className="font-bold" style={{ color: 'var(--ink)' }}>{badge.label}</span>
              {stats && (
                <span className="chip">#{stats.rank} in department</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--ink-faint)' }}>
              Rooms freed
            </div>
            <div className="text-3xl font-black mt-1" style={{ color: 'var(--ink)' }}>
              {stats?.reports ?? '–'}
            </div>
            <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>early releases reported</div>
          </div>
        </div>

        {next && (
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--ink-soft)' }}>
              <span>Next badge: <strong style={{ color: 'var(--ink)' }}>{next.icon} {next.label}</strong></span>
              <span>{toNext} pts to go</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-alt)' }}>
              <div className="h-full" style={{ width: `${progressPct}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>How to earn points</h2>
        <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
          <li>
            <strong style={{ color: 'var(--ink)' }}>+10 pts</strong> — report that a room was freed
            early (teacher ended class early, meeting ended, lab finished). Go to{' '}
            <strong style={{ color: 'var(--primary)' }}>Right Now</strong> and tap{' '}
            <em>Release Early</em> on any occupied room.
          </li>
          <li>Your report instantly turns the room <strong style={{ color: 'var(--ok)' }}>green/free</strong> for everyone else.</li>
          <li>Climb the leaderboard — earn badges at 20, 50, 100 and 250 pts.</li>
        </ul>
      </div>

      {/* Leaderboard */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between"
             style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
            🏆 Top contributors
          </h2>
          <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>Top 10</span>
        </div>
        {board.length === 0 ? (
          <div className="p-6 text-sm text-center" style={{ color: 'var(--ink-faint)' }}>
            No contributors yet. Be the first to help!
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {board.map((u, i) => {
                const b = currentBadge(u.reward_points);
                const isMe = u.id === user.id;
                return (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-5 py-3 w-12 font-black tabular-nums" style={{ color: 'var(--ink-faint)' }}>
                      {i + 1}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{b.icon}</span>
                        <div>
                          <div className="font-semibold" style={{ color: isMe ? 'var(--primary)' : 'var(--ink)' }}>
                            {u.name} {isMe && <span className="text-xs">(you)</span>}
                          </div>
                          <div className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                            {u.role} · {u.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-black tabular-nums" style={{ color: 'var(--primary)' }}>
                      {u.reward_points}
                      <span className="text-xs font-normal" style={{ color: 'var(--ink-faint)' }}> pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
