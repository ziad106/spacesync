export default function EmptyState({ message = 'No entries logged', sub = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 select-none">
      <pre className="text-[11px] leading-[1.7] font-mono text-on-surface-variant/20 mb-3">{
`┌──────────────────────┐
│                      │
│     no entries       │
│                      │
└──────────────────────┘`
      }</pre>
      <p className="text-sm text-on-surface-variant/50">{message}</p>
      {sub && <p className="text-xs text-on-surface-variant/30 mt-1">{sub}</p>}
    </div>
  );
}
