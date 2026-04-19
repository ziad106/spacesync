import { useState, useEffect } from 'react';
import API from './api';
import './App.css';

function App() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ requested_by: '', booking_date: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchResources = async () => setResources((await API.get('/resources')).data);
  const fetchBookings = async () => setBookings((await API.get('/bookings')).data);

  useEffect(() => { fetchResources(); fetchBookings(); }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.requested_by || !form.booking_date) { setMessage('⚠️ Fill all fields'); return; }
    setLoading(true); setMessage('');
    try {
      await API.post('/bookings', { resource_id: selected.id, ...form });
      setMessage('✅ Booking confirmed!');
      setForm({ requested_by: '', booking_date: '' });
      setSelected(null);
      fetchBookings();
    } catch (err) { setMessage('❌ ' + (err.response?.data?.error || 'Failed')); }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    await API.delete(`/bookings/${id}`);
    setBookings(bookings.filter(b => b.id !== id));
  };

  return (
    <div className="container">
      <h1>🏛️ SpaceSync — JU Resource Booking</h1>
      <section>
        <h2>Available Resources</h2>
        <div className="grid">
          {resources.map(r => (
            <div key={r.id} className="card">
              <h3>{r.name}</h3>
              <p>Type: {r.type}</p>
              <p>Capacity: {r.capacity}</p>
              <button onClick={() => setSelected(r)}>Book Now</button>
            </div>
          ))}
        </div>
      </section>
      {selected && (
        <section className="modal">
          <h2>Book: {selected.name}</h2>
          <form onSubmit={handleBook}>
            <input placeholder="Requested By" value={form.requested_by}
              onChange={e => setForm({ ...form, requested_by: e.target.value })} />
            <input type="date" value={form.booking_date}
              onChange={e => setForm({ ...form, booking_date: e.target.value })} />
            <button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Confirm'}</button>
            <button type="button" onClick={() => setSelected(null)}>Cancel</button>
          </form>
          {message && <p>{message}</p>}
        </section>
      )}
      <section>
        <h2>📅 Current Bookings</h2>
        <table>
          <thead><tr><th>Resource</th><th>By</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.Resource?.name}</td>
                <td>{b.requested_by}</td>
                <td>{b.booking_date}</td>
                <td><button onClick={() => handleCancel(b.id)}>Cancel</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
export default App;
