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

// --- Permission helpers ---------------------------------------------------
// Must mirror backend rules exactly (see backend/src/controllers/bookings.controller.js)
export const BOOKING_ROLES = ['Teacher', 'ClassRep', 'Staff', 'Admin'];

/** Logged-in user who is allowed to create bookings. */
export function canBook(user = getUser()) {
  return !!user && BOOKING_ROLES.includes(user.role);
}

/** Admin can cancel any booking; everyone else only bookings they own. */
export function canCancel(booking, user = getUser()) {
  if (!user || !booking) return false;
  if (user.role === 'Admin') return true;
  return booking.user_id != null && booking.user_id === user.id;
}

/** Short human-readable reason the current user cannot book. */
export function whyCannotBook(user = getUser()) {
  if (!user) return 'Please sign in to book a resource.';
  if (user.role === 'Student') {
    return 'Students cannot book resources directly — ask your Class Representative or a Teacher to book on your behalf.';
  }
  return `Your role (${user.role}) is not permitted to book.`;
}
