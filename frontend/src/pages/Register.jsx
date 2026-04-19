import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { setAuth } from '../auth';

const ROLES = [
  { value: 'Student',  label: 'Student',              desc: 'Book study rooms, see availability' },
  { value: 'Teacher',  label: 'Teacher',              desc: 'Book classrooms and labs for class' },
  { value: 'Staff',    label: 'Staff',                desc: 'Book meeting rooms and equipment' },
  { value: 'ClassRep', label: 'Class Representative', desc: 'Coordinate on behalf of your class' },
];

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    department: 'CSE',
    identifier: '',
  });
  const [busy, setBusy] = useState(false);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        department: form.department.trim() || 'CSE',
        identifier: form.identifier.trim(),
      });
      setAuth({ token, user });
      toast.success(`Welcome to SpaceSync, ${user.name}!`);
      nav('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto fade-in">
      <div className="card p-8">
        <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>
          SpaceSync · Register
        </p>
        <h1 className="text-3xl font-black mt-1" style={{ color: 'var(--ink)' }}>Create your account</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--ink-soft)' }}>
          Sign up to book resources and earn reward points by helping your department.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value} type="button" onClick={() => update('role', r.value)} disabled={busy}
                  className="text-left rounded-lg p-3 transition-colors border"
                  style={
                    form.role === r.value
                      ? { background: 'var(--primary)', color: 'var(--primary-ink)', borderColor: 'var(--primary)' }
                      : { background: 'var(--surface-alt)', color: 'var(--ink)', borderColor: 'var(--border)' }
                  }
                >
                  <div className="text-sm font-bold">{r.label}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" className="input" value={form.name}
                     onChange={(e) => update('name', e.target.value)} disabled={busy}
                     placeholder="Dr. Nasima Akter" />
            </div>
            <div>
              <label className="label" htmlFor="identifier">
                {form.role === 'Student' || form.role === 'ClassRep' ? 'Student ID' : 'Employee ID'}
                <span className="font-normal opacity-60"> (optional)</span>
              </label>
              <input id="identifier" className="input" value={form.identifier}
                     onChange={(e) => update('identifier', e.target.value)} disabled={busy}
                     placeholder={form.role === 'Student' || form.role === 'ClassRep' ? 'CSE-2021-042' : 'EMP-0001'} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" value={form.email}
                   onChange={(e) => update('email', e.target.value)} disabled={busy}
                   placeholder="you@ju.edu" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" value={form.password}
                     onChange={(e) => update('password', e.target.value)} disabled={busy}
                     placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label" htmlFor="department">Department</label>
              <input id="department" className="input" value={form.department}
                     onChange={(e) => update('department', e.target.value)} disabled={busy}
                     placeholder="CSE" />
            </div>
          </div>

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm mt-5 text-center" style={{ color: 'var(--ink-soft)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
