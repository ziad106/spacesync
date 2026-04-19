import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const rolePill = {
  admin:   'bg-primary/10 text-primary border-primary/30',
  teacher: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  student: 'bg-secondary/10 text-secondary border-secondary/30',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user: me } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await API.get('/auth/users');
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const promote = async (id, role) => {
    try {
      await API.patch(`/auth/users/${id}/role`, { role });
      setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
      addToast('Role updated', 'success');
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  if (loading) return <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl h-48 animate-pulse" />;

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20">
            {['Operator', 'Email', 'Department', 'Role', 'Promote'].map(h => (
              <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {users.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors last:border-0"
              >
                <td className="px-5 py-3.5 font-medium text-on-surface">{u.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant/50">{u.email}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant/40">{u.department || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${rolePill[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-5 py-3.5">
                  {u.id !== me?.id && (
                    <select
                      value={u.role}
                      onChange={e => promote(u.id, e.target.value)}
                      className="bg-surface-container border border-outline-variant/30 text-on-surface-variant text-xs rounded px-2 py-1 focus:outline-none focus:border-tertiary"
                    >
                      {['student', 'teacher', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
