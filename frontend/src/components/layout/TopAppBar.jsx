import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const rolePill = {
  admin:   'bg-primary/10 text-primary border-primary/30',
  teacher: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  student: 'bg-secondary/10 text-secondary border-secondary/30',
};

export default function TopAppBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 flex items-center px-6 gap-4">
      <div className="w-72 shrink-0 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[22px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>hub</span>
        <span className="text-on-surface font-semibold tracking-tight text-base">SpaceSync</span>
        <span className="text-on-surface-variant/40 text-sm font-mono ml-1">v2</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
        className="hidden md:flex items-center gap-2 text-sm font-medium text-on-surface-variant bg-surface-container border border-outline-variant/20 px-4 py-2.5 rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
        title="Open search (Ctrl+K)"
      >
        <span>⌘K</span>
        <span>search</span>
      </button>

      {user && (
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${rolePill[user.role]}`}>
            {user.role}
          </span>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-on-surface leading-tight">{user.name}</p>
            <p className="text-xs text-on-surface-variant/50 leading-tight">{user.email}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
