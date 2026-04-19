import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  }`;

export default function NavBar() {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center font-extrabold shadow-sm">
            S
          </div>
          <div>
            <div className="font-extrabold leading-tight tracking-tight">SpaceSync</div>
            <div className="text-[11px] text-slate-500 leading-tight">JU CSE · Resource Booking</div>
          </div>
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/bookings" className={linkClass}>Schedule</NavLink>
        </nav>
      </div>
    </header>
  );
}
