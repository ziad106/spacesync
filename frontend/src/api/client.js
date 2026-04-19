import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
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
    return Promise.reject(normalized);
  }
);

export const api = {
  health: () => client.get('/health').then((r) => r.data),
  listResources: () => client.get('/resources').then((r) => r.data),
  createResource: (payload) => client.post('/resources', payload).then((r) => r.data),
  listBookings: () => client.get('/bookings').then((r) => r.data),
  createBooking: (payload) => client.post('/bookings', payload).then((r) => r.data),
  deleteBooking: (id) => client.delete(`/bookings/${id}`).then((r) => r.data),
};

export default client;
