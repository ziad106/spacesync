import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/auth/user-count').then(r => setIsFirst(r.data.count === 0)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isFirst && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3"
        >
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">shield</span>
          <div>
            <p className="text-xs font-semibold text-primary">Initialize Admin Terminal</p>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">This operator will receive full system administrator privileges.</p>
          </div>
        </motion.div>
      )}

      {[['name', 'Full Name', 'text', 'Dr. Arif Hossain'], ['email', 'Email', 'email', 'operator@ju.edu'], ['password', 'Password', 'password', '••••••••']].map(([key, label, type, ph]) => (
        <div key={key}>
          <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">{label}</label>
          <input
            type={type}
            value={form[key]}
            onChange={set(key)}
            placeholder={ph}
            className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 text-sm px-0 py-2 transition-colors"
          />
        </div>
      ))}

      <div>
        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Role</label>
        <select
          value={isFirst ? 'admin' : form.role}
          onChange={set('role')}
          disabled={isFirst}
          className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface text-sm px-0 py-2 disabled:opacity-50"
        >
          {isFirst
            ? <option value="admin">Admin (System Initialize)</option>
            : ['student', 'teacher'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)
          }
        </select>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Department <span className="text-on-surface-variant/30">(optional)</span></label>
        <input
          type="text"
          value={form.department}
          onChange={set('department')}
          placeholder="CSE"
          className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 text-sm px-0 py-2 transition-colors"
        />
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-xs animate-pulse">{error}</motion.p>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-semibold disabled:opacity-50"
      >
        {loading ? 'Initializing...' : isFirst ? 'Initialize Admin Terminal' : 'Register Operator'}
      </motion.button>

      <p className="text-center text-xs text-on-surface-variant/40">
        Already initialized?{' '}
        <Link to="/login" className="text-primary hover:text-primary-fixed transition-colors">Access terminal</Link>
      </p>
    </form>
  );
}
