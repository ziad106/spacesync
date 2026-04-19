import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="operator@ju.edu"
          className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 text-sm px-0 py-2 transition-colors"
        />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 text-sm px-0 py-2 transition-colors"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.remember}
          onChange={set('remember')}
          className="w-3.5 h-3.5 rounded-none bg-surface-container border-outline/40 text-tertiary focus:ring-0 focus:ring-offset-0"
        />
        <span className="text-xs text-on-surface-variant/50">Remember terminal</span>
      </label>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-error text-xs animate-pulse"
        >{error}</motion.p>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-semibold disabled:opacity-50 transition-opacity"
      >
        {loading
          ? <span className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60 animate-pulse" />
              Authenticating
            </span>
          : 'Access Sanctum'}
      </motion.button>

      <p className="text-center text-xs text-on-surface-variant/40">
        New operator?{' '}
        <Link to="/register" className="text-primary hover:text-primary-fixed transition-colors">Initialize terminal</Link>
      </p>
    </form>
  );
}
