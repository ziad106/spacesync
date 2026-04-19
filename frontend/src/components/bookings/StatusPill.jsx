export default function StatusPill({ status = 'Confirmed' }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-tertiary/10 text-tertiary border border-tertiary/30 shadow-[0_0_15px_rgba(0,219,231,0.2)]">
      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
      {status}
    </span>
  );
}
