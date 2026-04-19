import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { setAuth } from '../auth';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = loc.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  // Sticky alert for Pending / Rejected statuses (more visible than a toast).
  const [statusAlert, setStatusAlert] = useState(null); // { kind: 'Pending'|'Rejected', message }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      toast.error('Enter email and password');
      return;
    }
    setBusy(true);
    setStatusAlert(null);
    try {
      const { token, user } = await api.login({ email: email.trim(), password });
      setAuth({ token, user });
      toast.success(`Welcome back, ${user.name}!`);
      nav(redirectTo, { replace: true });
    } catch (err) {
      // Special-case the admin-approval statuses so the user sees a prominent
      // explanation instead of a fleeting toast.
      const kind = err?.data?.status;
      if (kind === 'Pending' || kind === 'Rejected') {
        setStatusAlert({ kind, message: err.message });
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setBusy(false);
    }
  }

  function quickFill(preset) {
    setEmail(preset);
    setPassword('password123');
  }

  return (
    <div className="max-w-md mx-auto fade-in">
      <div className="card p-8">
        <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>
          SpaceSync · Sign in
        </p>
        <h1 className="text-3xl font-black mt-1" style={{ color: 'var(--ink)' }}>Welcome back</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--ink-soft)' }}>
          Log in to book rooms, earn rewards and help others find free spaces.
        </p>

        {statusAlert && (
          <div
            className="mt-5 p-4 rounded-lg text-sm flex items-start gap-3"
            style={{
              background: statusAlert.kind === 'Rejected' ? 'var(--danger-soft)' : 'var(--warn-soft)',
              color: 'var(--ink)',
              borderLeft: `4px solid ${statusAlert.kind === 'Rejected' ? 'var(--danger)' : 'var(--warn)'}`,
            }}
          >
            <span className="text-xl leading-none">
              {statusAlert.kind === 'Rejected' ? '⛔' : '⏳'}
            </span>
            <div>
              <div className="font-bold">
                {statusAlert.kind === 'Rejected'
                  ? 'Account rejected'
                  : 'Awaiting admin approval'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                {statusAlert.message}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email" className="input" type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy}
              placeholder="you@ju.edu"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password" className="input" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy}
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink-soft)' }}>
            Demo accounts (password: <code>password123</code>)
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              ['Admin', 'admin@ju.edu'],
              ['Teacher', 'teacher@ju.edu'],
              ['CR', 'cr@ju.edu'],
              ['Staff', 'staff@ju.edu'],
              ['Student', 'student@ju.edu'],
            ].map(([label, em]) => (
              <button
                key={em} type="button" onClick={() => quickFill(em)}
                className="btn-ghost text-xs !py-1.5"
              >
                {label} · {em.split('@')[0]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm mt-5 text-center" style={{ color: 'var(--ink-soft)' }}>
          New here?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
