import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Availability from './pages/Availability';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/bookings" element={<Schedule />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer style={{ borderTop: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface) 80%, transparent)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs flex flex-col sm:flex-row gap-1 justify-between" style={{ color: 'var(--ink-faint)' }}>
          <span>SpaceSync © {new Date().getFullYear()} — CSE, Jahangirnagar University</span>
          <span>CSE 362 Lab Final</span>
        </div>
      </footer>
    </div>
  );
}
