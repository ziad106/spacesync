import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import API from '../../api';

export default function CommandPalette({ onBook, onClose }) {
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    API.get('/resources').then(r => setResources(r.data)).catch(() => {});
  }, []);

  const results = resources.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.type.toLowerCase().includes(query.toLowerCase())
  );

  const typeIcon = { Room: 'door_front', Equipment: 'memory', Lab: 'science' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[150] flex items-start justify-center pt-28 px-4"
      style={{ background: 'rgba(9,14,28,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-[24px]">search</span>
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="flex-1 bg-transparent text-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
          />
          <kbd className="text-xs font-mono bg-surface-container-highest border border-outline/20 px-1.5 py-0.5 rounded text-on-surface-variant">ESC</kbd>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-sm text-on-surface-variant/40 py-10 font-mono">
              {query ? `No match for "${query}"` : 'Type to search resources'}
            </p>
          ) : results.map(r => (
            <button
              key={r.id}
              onClick={() => { onBook(r); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-container text-left transition-colors border-b border-outline-variant/10 last:border-0"
            >
              <span className="material-symbols-outlined text-primary text-[24px]">{typeIcon[r.type] || 'inventory_2'}</span>
              <span className="text-lg text-on-surface flex-1 font-medium">{r.name}</span>
              <span className="text-xs font-mono text-on-surface-variant/50">{r.type}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
