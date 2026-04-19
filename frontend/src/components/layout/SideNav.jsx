import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/',               label: 'Dashboard',    icon: 'grid_view' },
  { to: '/bookings',       label: 'Allocations',  icon: 'calendar_month' },
];

const adminItems = [
  { to: '/admin/users',     label: 'Operators',    icon: 'manage_accounts' },
  { to: '/admin/resources', label: 'Resources',    icon: 'inventory_2' },
];

function NavItem({ to, label, icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-lg font-medium transition-colors w-full rounded-l-none ${
          isActive
            ? 'bg-tertiary/10 text-tertiary border-r-2 border-tertiary'
            : 'text-on-surface-variant/70 hover:bg-surface-container/50 hover:text-primary border-r-2 border-transparent'
        }`
      }
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function SideNav() {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 bg-surface-container-lowest/80 border-r border-outline-variant/20 flex flex-col z-40 backdrop-blur-md">
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="px-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant/50 font-mono mb-3 font-semibold">Navigation</p>
        <div className="space-y-0.5">
          <NavItem to="/" label="Dashboard" icon="grid_view" end />
          <NavItem to="/bookings" label="Allocations" icon="calendar_month" />
        </div>

        {user?.role === 'admin' && (
          <>
            <p className="px-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant/50 font-mono mt-6 mb-3 font-semibold">Admin Terminal</p>
            <div className="space-y-0.5">
              {adminItems.map(item => <NavItem key={item.to} {...item} />)}
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-outline-variant/20">
        <p className="text-xs font-mono text-on-surface-variant/30">Ctrl+K — command palette</p>
      </div>
    </aside>
  );
}
