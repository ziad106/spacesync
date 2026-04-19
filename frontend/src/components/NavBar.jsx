import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEffectiveTheme, toggleTheme } from '../theme';
import { getUser, logout, onAuthChange } from '../auth';

function linkClass({ isActive }) {
  return `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'nav-active' : 'nav-inactive'
  }`;
}

export default function NavBar() {
  const nav = useNavigate();
  const [theme, setTheme] = useState(getEffectiveTheme());
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onChange = (e) => setTheme(e.detail || getEffectiveTheme());
    window.addEventListener('themechange', onChange);
    return () => window.removeEventListener('themechange', onChange);
  }, []);

  useEffect(() => onAuthChange((u) => setUser(u)), []);

  useEffect(() => {
    function close() { setMenuOpen(false); }
    if (menuOpen) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [menuOpen]);

  function handleLogout(e) {
    e.stopPropagation();
    logout();
    toast.success('Logged out');
    setMenuOpen(false);
    nav('/login');
  }

  const initials = user?.name
    ? user.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
    : '';

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
              className="ml-1 w-9 h-9 rounded-lg grid place-items-center transition-colors nav-inactive"
              aria-label="Toggle dark mode"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>

            {user ? (
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                  aria-haspopup="menu" aria-expanded={menuOpen}
                >
                  <span
                    className="w-8 h-8 rounded-full grid place-items-center text-xs font-black"
                    style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                  >
                    {initials}
                  </span>
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                      ★ {user.reward_points ?? 0}
                    </span>
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>▾</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    role="menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{user.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                        {user.role} · {user.department}
                      </div>
                      <div className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--accent)' }}>
                        ★ {user.reward_points ?? 0} reward pts
                      </div>
                    </div>
                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-semibold"
                      style={{ color: 'var(--ink)' }}
                    >
                      My Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm font-semibold"
                      style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)' }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Sign&nbsp;in</NavLink>
                <NavLink
                  to="/register"
                  className="ml-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                  style={{ background: 'var(--primary)', color: 'var(--primary-ink)' }}
                >
                  Sign&nbsp;up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
