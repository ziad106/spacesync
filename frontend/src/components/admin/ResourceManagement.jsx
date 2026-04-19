import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import API from '../../api';

const ROLE_OPTIONS = [
  { label: 'ALL',        value: 'admin,teacher,student' },
  { label: 'TEACHER+',   value: 'admin,teacher' },
  { label: 'ADMIN ONLY', value: 'admin' },
];

export default function ResourceManagement({ resources, onRefresh }) {
  const [form, setForm] = useState({ name: '', type: 'Room', capacity: '', allowed_roles: 'admin,teacher,student' });
  const [adding, setAdding] = useState(false);
  const { addToast } = useToast();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.capacity) return;
    setAdding(true);
    try {
      await API.post('/resources', { ...form, capacity: Number(form.capacity) });
      addToast('Resource created', 'success');
      setForm({ name: '', type: 'Room', capacity: '', allowed_roles: 'admin,teacher,student' });
      onRefresh();
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/resources/${id}`);
      addToast('Resource removed', 'success');
      onRefresh();
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-4">Add Resource</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[['name', 'Name', 'text', 'Networking Lab'], ['capacity', 'Capacity', 'number', '40']].map(([k, label, type, ph]) => (
            <div key={k}>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1.5">{label}</label>
              <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
                className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 text-sm px-0 py-1.5 transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1.5">Type</label>
            <select value={form.type} onChange={set('type')}
              className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface text-sm px-0 py-1.5">
              {['Room', 'Equipment', 'Lab'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1.5">Access Level</label>
            <select value={form.allowed_roles} onChange={set('allowed_roles')}
              className="w-full bg-surface-container-lowest border-0 border-b border-outline/40 focus:border-tertiary focus:ring-0 text-on-surface text-sm px-0 py-1.5">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={adding}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-semibold disabled:opacity-50">
          {adding ? 'Adding...' : 'Add Resource'}
        </motion.button>
      </form>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20">
              {['Name', 'Type', 'Capacity', 'Access', ''].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {resources.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors last:border-0">
                  <td className="px-5 py-3.5 font-medium text-on-surface">{r.name}</td>
                  <td className="px-5 py-3.5 text-on-surface-variant/60 text-xs">{r.type}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant/60">{r.capacity}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[9px] font-mono uppercase text-tertiary bg-tertiary/10 border border-tertiary/30 px-1.5 py-0.5 rounded-full">
                      {ROLE_OPTIONS.find(o => o.value === r.allowed_roles)?.label || 'ALL'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant/40 hover:text-error hover:bg-error-container/20 transition-all">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
