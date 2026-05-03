import { useServiceDetail } from './hooks';

interface ServiceDrawerProps {
  serviceId: string | null;
  onClose: () => void;
}

const CRITICALITY_BADGE: Record<string, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

export default function ServiceDrawer({ serviceId, onClose }: ServiceDrawerProps) {
  const { data: service, isLoading, isError } = useServiceDetail(serviceId);

  if (!serviceId) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-surface-800 border-l border-surface-600 z-10 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-600">
        <h3 className="font-semibold text-white text-sm">Service Details</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-200 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Could not load service details.</p>
            <p className="text-gray-600 text-xs mt-1 font-mono">{serviceId}</p>
          </div>
        )}

        {service && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <p className="text-lg font-bold text-white">{service.name}</p>
              {service.description && (
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
              )}
            </div>

            {/* Criticality */}
            <div className="flex items-center gap-2">
              <span className={CRITICALITY_BADGE[service.criticalityLevel] || 'badge-medium'}>
                {service.criticalityLevel}
              </span>
              <span className="text-xs text-gray-500">{service.communicationType}</span>
            </div>

            {/* Details Table */}
            <div className="space-y-2">
              {[
                { label: 'Owner Team', value: service.ownerTeam },
                { label: 'Version', value: service.currentVersion, mono: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm py-2 border-b border-surface-600">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={row.mono ? 'font-mono text-gray-300' : 'text-gray-200'}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Repo Link */}
            {service.repositoryUrl && (
              <a
                href={service.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-brand-500 hover:underline font-mono truncate"
              >
                {service.repositoryUrl}
              </a>
            )}
          </div>
        )}

        {/* Fallback for services not in registry */}
        {!isLoading && !isError && !service && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Service not in registry.</p>
            <p className="font-mono text-gray-600 text-xs mt-1">{serviceId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
