import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DoorOpen, Cpu, FlaskConical, Box } from 'lucide-react';

const TYPE_ICONS = { Room: DoorOpen, Equipment: Cpu, Lab: FlaskConical };

export default function CommandPalette({ resources, onBook, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = resources.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-panel border border-line rounded-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources by name or type..."
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
          />
          <kbd className="text-[10px] font-mono bg-elevated border border-line px-1.5 py-0.5 rounded text-muted shrink-0">ESC</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-xs text-muted py-10">No results for "{query}"</p>
          ) : (
            results.map(r => {
              const Icon = TYPE_ICONS[r.type] || Box;
              return (
                <button
                  key={r.id}
                  onClick={() => { onBook(r); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-elevated text-left transition-colors border-b border-line/40 last:border-0"
                >
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-sm text-primary flex-1">{r.name}</span>
                  <span className="text-[10px] font-mono text-muted">{r.type}</span>
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
