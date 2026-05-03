import type { GraphFilters, DependencyType } from './types';

const ALL_DEP_TYPES: DependencyType[] = ['REST', 'GRPC', 'EVENT_DRIVEN', 'QUEUE_BASED'];

interface FilterPanelProps {
  filters: GraphFilters;
  onChange: (filters: GraphFilters) => void;
  nodeCount: number;
  edgeCount: number;
}

const TYPE_COLORS: Record<string, string> = {
  REST: 'bg-blue-500',
  GRPC: 'bg-purple-500',
  EVENT_DRIVEN: 'bg-yellow-500',
  QUEUE_BASED: 'bg-green-500',
};

export default function FilterPanel({ filters, onChange, nodeCount, edgeCount }: FilterPanelProps) {
  const toggleType = (type: DependencyType) => {
    const active = filters.dependencyTypes;
    const next = active.includes(type)
      ? active.filter(t => t !== type)
      : [...active, type];
    onChange({ ...filters, dependencyTypes: next });
  };

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 space-y-4">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Search</label>
        <input
          type="text"
          placeholder="Filter by service name..."
          className="input text-sm"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Dependency Types */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Dependency Type</label>
        <div className="flex flex-wrap gap-2">
          {ALL_DEP_TYPES.map(type => {
            const active = filters.dependencyTypes.length === 0 || filters.dependencyTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                  active
                    ? 'border-surface-500 bg-surface-700 text-gray-200'
                    : 'border-surface-700 bg-surface-900 text-gray-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[type]}`} />
                {type.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Critical Only */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-300">Critical paths only</label>
          <p className="text-xs text-gray-600 mt-0.5">Show animated red edges</p>
        </div>
        <button
          onClick={() => onChange({ ...filters, criticalOnly: !filters.criticalOnly })}
          className={`relative w-10 h-5 rounded-full transition-colors ${filters.criticalOnly ? 'bg-brand-500' : 'bg-surface-600'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${filters.criticalOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-surface-600 grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-xl font-bold text-brand-500">{nodeCount}</p>
          <p className="text-xs text-gray-600">Services</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-300">{edgeCount}</p>
          <p className="text-xs text-gray-600">Dependencies</p>
        </div>
      </div>
    </div>
  );
}
