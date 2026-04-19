// Minimal auth store for SpaceSync — JWT in localStorage,
// pub/sub via a custom 'authchange' window event.
const TOKEN_KEY = 'spacesync.token';
const USER_KEY  = 'spacesync.user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function isAuthed() {
  return Boolean(getToken() && getUser());
}

export function setAuth({ token, user }) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
  window.dispatchEvent(new CustomEvent('authchange', { detail: user }));
}

export function updateUser(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
  window.dispatchEvent(new CustomEvent('authchange', { detail: user }));
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent('authchange', { detail: null }));
}

export function onAuthChange(cb) {
  const h = (e) => cb(e.detail ?? getUser());
  window.addEventListener('authchange', h);
  return () => window.removeEventListener('authchange', h);
}
