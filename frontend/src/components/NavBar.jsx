import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-700 hover:bg-slate-200'
  }`;

export default function NavBar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">S</div>
          <div>
            <div className="font-bold leading-tight">SpaceSync</div>
            <div className="text-xs text-slate-500 leading-tight">JU CSE Resource Booking</div>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/bookings" className={linkClass}>Schedule</NavLink>
        </nav>
      </div>
    </header>
  );
}
