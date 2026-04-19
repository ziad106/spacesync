import { useState, useEffect, useCallback } from 'react';
import API from '../api';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings');
      setBookings(data);
    } catch { setBookings([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createBooking = async (payload) => {
    const { data } = await API.post('/bookings', payload);
    return data;
  };

  const cancelBooking = async (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    try { await API.delete(`/bookings/${id}`); }
    catch (err) { await fetch(); throw err; }
  };

  return { bookings, loading, refetch: fetch, createBooking, cancelBooking };
}
