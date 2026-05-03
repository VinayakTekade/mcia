import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { servicesApi, changesApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { ChangeRequest } from '../types';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'badge-medium',
  SUBMITTED: 'bg-blue-900/50 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full',
  UNDER_REVIEW: 'bg-purple-900/50 text-purple-400 text-xs font-medium px-2 py-0.5 rounded-full',
  APPROVED: 'badge-low',
  REJECTED: 'badge-critical',
  NEEDS_REVISION: 'badge-high',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list({ limit: 5 }),
  });
  const { data: changesData, isLoading: changesLoading } = useQuery({
    queryKey: ['changes'],
    queryFn: changesApi.list,
  });

  const changes: ChangeRequest[] = changesData || [];
  const totalServices = servicesData?.total || 0;
  const pendingReview = changes.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const approved = changes.filter(c => c.status === 'APPROVED').length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Services', value: servicesLoading ? '...' : totalServices, color: 'text-brand-500' },
          { label: 'Pending Review', value: changesLoading ? '...' : pendingReview, color: 'text-yellow-400' },
          { label: 'Approved Changes', value: changesLoading ? '...' : approved, color: 'text-green-400' },
          { label: 'Total Changes', value: changesLoading ? '...' : changes.length, color: 'text-gray-300' },
        ].map(stat => (
          <div key={stat.label} className="card">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Changes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Change Requests</h2>
            <Link to="/changes" className="text-xs text-brand-500 hover:underline">View all</Link>
          </div>
          {changesLoading ? <LoadingSpinner /> : (
            <div className="space-y-3">
              {changes.slice(0, 5).map((cr) => (
                <Link key={cr.id} to={`/changes/${cr.id}`} className="block hover:bg-surface-700 rounded-lg p-3 -mx-3 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{cr.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cr.targetServiceId} · {cr.changeType.replace('_', ' ')}</p>
                    </div>
                    <span className={STATUS_COLORS[cr.status] || 'badge-medium'}>{cr.status}</span>
                  </div>
                </Link>
              ))}
              {changes.length === 0 && <p className="text-sm text-gray-600 text-center py-6">No change requests yet.</p>}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/changes/new', label: 'New Change Request', icon: '📝', desc: 'Propose a service change' },
              { to: '/services', label: 'Service Registry', icon: '🗂', desc: 'Browse all services' },
              { to: '/dependencies', label: 'Dependency Map', icon: '🔗', desc: 'Visualize service graph' },
              { to: '/notifications', label: 'Notifications', icon: '🔔', desc: 'View your inbox' },
            ].map(action => (
              <Link key={action.to} to={action.to} className="bg-surface-700 hover:bg-surface-600 border border-surface-500 rounded-lg p-4 transition-colors">
                <span className="text-2xl">{action.icon}</span>
                <p className="text-sm font-medium text-gray-200 mt-2">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
