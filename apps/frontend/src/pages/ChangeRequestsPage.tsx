import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { changesApi } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import type { ChangeRequest } from '../types';

export default function ChangeRequestsPage() {
  const { data, isLoading } = useQuery<ChangeRequest[]>({
    queryKey: ['changes'],
    queryFn: changesApi.list,
  });

  const changes = data || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Change Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{changes.length} total</p>
        </div>
        <Link to="/changes/new" className="btn-primary">+ New Request</Link>
      </div>

      {isLoading ? <LoadingSpinner /> : changes.length === 0 ? (
        <EmptyState title="No change requests" description="Create your first change request to get started." />
      ) : (
        <div className="space-y-3">
          {changes.map((cr) => (
            <Link key={cr.id} to={`/changes/${cr.id}`}
              className="card flex items-center justify-between hover:border-brand-500/40 transition-colors">
              <div>
                <p className="font-medium text-gray-200">{cr.title}</p>
                <p className="text-xs text-gray-500 mt-1">{cr.targetServiceId} · {cr.changeType.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {cr.blastRadius != null && (
                  <span className="text-orange-400 text-sm font-bold">Blast: {cr.blastRadius}</span>
                )}
                <span className="text-sm text-gray-400">{cr.status}</span>
                <span className="text-gray-600">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
