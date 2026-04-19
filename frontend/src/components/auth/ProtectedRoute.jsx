import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TopAppBar from '../layout/TopAppBar';
import SideNav from '../layout/SideNav';
import SessionLock from '../common/SessionLock';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SessionLock />
      <TopAppBar />
      <SideNav />
      <main className="ml-72 pt-16 relative min-h-screen">
        {children}
      </main>
    </div>
  );
}
