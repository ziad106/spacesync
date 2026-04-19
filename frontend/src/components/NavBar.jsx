import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getEffectiveTheme, toggleTheme } from '../theme';

function linkClass({ isActive }) {
  return `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'nav-active' : 'nav-inactive'
  }`;
}

export default function NavBar() {
  const [theme, setTheme] = useState(getEffectiveTheme());

  useEffect(() => {
    const onChange = (e) => setTheme(e.detail || getEffectiveTheme());
    window.addEventListener('themechange', onChange);
    return () => window.removeEventListener('themechange', onChange);
  }, []);

  return (
    <>
      <style>{`
        .nav-active   { background: var(--primary); color: var(--primary-ink); }
        .nav-inactive { color: var(--ink-soft); }
        .nav-inactive:hover { background: var(--surface-alt); color: var(--ink); }
        .nav-wrap     { background: color-mix(in srgb, var(--surface) 85%, transparent); border-bottom: 1px solid var(--border); backdrop-filter: blur(10px); }
        .brand-mark   { background: var(--primary); color: var(--primary-ink); }
      `}</style>
      <header className="nav-wrap sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="brand-mark w-10 h-10 rounded-lg grid place-items-center font-black text-lg shadow-sm tracking-tight">
              JU
            </div>
            <div>
              <div className="font-black leading-tight tracking-tight text-[17px]" style={{ color: 'var(--ink)' }}>
                SpaceSync
              </div>
              <div className="text-[11px] leading-tight uppercase tracking-[0.12em]" style={{ color: 'var(--ink-faint)' }}>
                CSE · Resource Booking
              </div>
            </div>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/availability" className={linkClass}>Right&nbsp;Now</NavLink>
            <NavLink to="/bookings" className={linkClass}>Schedule</NavLink>
            <button
              type="button"
              onClick={() => setTheme(toggleTheme())}
              className="ml-2 w-9 h-9 rounded-lg grid place-items-center transition-colors nav-inactive"
              aria-label="Toggle dark mode"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
