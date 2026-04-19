import AmbientGlow from '../components/layout/AmbientGlow';
import UserManagement from '../components/admin/UserManagement';

export default function AdminUsers() {
  return (
    <div className="p-6 relative min-h-screen">
      <AmbientGlow />
      <div className="mb-8">
        <h1 className="text-5xl font-headline font-bold text-primary tracking-[-0.02em]">Operators</h1>
        <p className="text-sm text-on-surface-variant/60 mt-2">Manage system operators and their access roles</p>
      </div>
      <UserManagement />
    </div>
  );
}
