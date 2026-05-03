import { useAuthStore } from '../store/authStore';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide configuration (Admin only)</p>
      </div>
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Current Session</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
            { label: 'User ID', value: user?.id },
          ].map(item => (
            <div key={item.label} className="flex gap-4 py-2 border-b border-surface-600 last:border-0">
              <span className="text-gray-500 w-24">{item.label}</span>
              <span className="font-mono text-gray-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-white mb-3">Service URLs</h2>
        <p className="text-xs text-gray-500">All traffic routes through the API Gateway at <code className="text-brand-500">http://localhost:3000</code></p>
      </div>
    </div>
  );
}
