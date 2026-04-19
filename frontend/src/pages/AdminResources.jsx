import AmbientGlow from '../components/layout/AmbientGlow';
import ResourceManagement from '../components/admin/ResourceManagement';
import { useResources } from '../hooks/useResources';

export default function AdminResources() {
  const { resources, refetch } = useResources();
  return (
    <div className="p-6 relative min-h-screen">
      <AmbientGlow />
      <div className="mb-8">
        <h1 className="text-5xl font-headline font-bold text-primary tracking-[-0.02em]">Resources</h1>
        <p className="text-sm text-on-surface-variant/60 mt-2">Create, configure, and remove system resources</p>
      </div>
      <ResourceManagement resources={resources} onRefresh={refetch} />
    </div>
  );
}
