import ResourceCard from './ResourceCard';
import EmptyState from '../common/EmptyState';

export default function ResourceGrid({ resources, bookings, loading, onBook }) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-surface-container-low border border-outline-variant/20 rounded-xl h-48 animate-pulse" />
      ))}
    </div>
  );

  if (!resources.length) return <EmptyState message="No resources configured" sub="Contact the system administrator" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((r, i) => (
        <ResourceCard key={r.id} resource={r} bookings={bookings} onBook={onBook} index={i} />
      ))}
    </div>
  );
}
