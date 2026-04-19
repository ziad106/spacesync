// Tiny theme manager (no Context needed — reads from localStorage + custom event)
const KEY = 'spacesync.theme';

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {}
  return null;
}

export function getEffectiveTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
}

export function setTheme(theme) {
  try { localStorage.setItem(KEY, theme); } catch {}
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function toggleTheme() {
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

// Call on app boot BEFORE React renders to avoid flash of wrong theme.
export function initTheme() {
  applyTheme(getEffectiveTheme());
}
