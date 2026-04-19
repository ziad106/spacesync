import { LayoutGrid, CalendarDays, Terminal } from 'lucide-react';

const NAV = [
  { id: 'resources', label: 'Resources', icon: LayoutGrid },
  { id: 'bookings',  label: 'Bookings',  icon: CalendarDays },
];

export default function Sidebar({ view, onViewChange }) {
  return (
    <aside className="w-52 shrink-0 bg-panel border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-line">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-primary tracking-tight">SpaceSync</span>
        </div>
        <p className="text-[11px] text-muted mt-0.5">JU Lab Console</p>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                active
                  ? 'bg-elevated text-primary border border-line'
                  : 'text-muted hover:text-primary hover:bg-elevated/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : ''}`} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line">
        <p className="text-[10px] font-mono text-muted/60">Ctrl+K — quick search</p>
      </div>
    </aside>
  );
}
