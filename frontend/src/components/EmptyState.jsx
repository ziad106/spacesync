export default function EmptyState({ message = 'No bookings logged' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 select-none">
      <pre className="text-[11px] leading-[1.6] font-mono text-muted/40 mb-3">{
`┌──────────────────┐
│                  │
│   no entries     │
│                  │
└──────────────────┘`
      }</pre>
      <p className="text-xs text-muted">{message}</p>
    </div>
  );
}
