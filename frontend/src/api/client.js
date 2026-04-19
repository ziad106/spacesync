import axios from 'axios';
import { getToken, logout } from '../auth';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT if present
client.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Normalize error messages so UI can just show err.message
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.statusText ||
      err?.message ||
      'Network error';
    const normalized = new Error(msg);
    normalized.status = err?.response?.status;
    normalized.original = err;
    // Auto-logout on 401 so user is kicked back to the login page
    if (normalized.status === 401 && getToken()) logout();
    return Promise.reject(normalized);
  }
);

export const api = {
  health: () => client.get('/health').then((r) => r.data),

  // auth
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  login:    (payload) => client.post('/auth/login', payload).then((r) => r.data),
  me:       ()        => client.get('/auth/me').then((r) => r.data),
  leaderboard: ()     => client.get('/auth/leaderboard').then((r) => r.data),

  // resources
  listResources: () => client.get('/resources').then((r) => r.data),
  createResource: (payload) => client.post('/resources', payload).then((r) => r.data),

  // bookings
  listBookings: () => client.get('/bookings').then((r) => r.data),
  createBooking: (payload) => client.post('/bookings', payload).then((r) => r.data),
  deleteBooking: (id) => client.delete(`/bookings/${id}`).then((r) => r.data),
  releaseBooking: (id, note) =>
    client.post(`/bookings/${id}/release`, { note }).then((r) => r.data),
};

export default client;
