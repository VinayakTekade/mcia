import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import type { Microservice } from '../types';

const CRITICALITY_BADGE: Record<string, string> = {
  LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', CRITICAL: 'badge-critical',
};

export default function ServiceRegistryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['services', search, page],
    queryFn: () => servicesApi.list({ search, page, limit: 10 }),
  });

  const services: Microservice[] = data?.data || [];
  const total: number = data?.total || 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Registry</h1>
          <p className="text-gray-500 text-sm mt-1">{total} services registered</p>
        </div>
      </div>

      <div className="card p-4">
        <input
          type="text"
          placeholder="Search by name or team..."
          className="input max-w-sm"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading ? <LoadingSpinner /> : services.length === 0 ? (
        <EmptyState title="No services found" description="Try adjusting your search." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-600 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Service</th>
                <th className="text-left px-6 py-3">Team</th>
                <th className="text-left px-6 py-3">Version</th>
                <th className="text-left px-6 py-3">Type</th>
                <th className="text-left px-6 py-3">Criticality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-surface-700 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-200">{svc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{svc.description || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{svc.ownerTeam}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-400 bg-surface-700 px-2 py-0.5 rounded">{svc.currentVersion}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{svc.communicationType}</td>
                  <td className="px-6 py-4">
                    <span className={CRITICALITY_BADGE[svc.criticalityLevel] || 'badge-medium'}>{svc.criticalityLevel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-end gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">← Prev</button>
          <span className="btn-secondary text-sm cursor-default">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} className="btn-secondary text-sm">Next →</button>
        </div>
      )}
    </div>
  );
}
