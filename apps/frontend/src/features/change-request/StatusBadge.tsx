import type { ChangeStatus } from '../../types';

const STATUS_CONFIG: Record<ChangeStatus, { label: string; classes: string }> = {
  DRAFT: {
    label: '⬜ Draft',
    classes: 'bg-gray-800 text-gray-400 border border-gray-700',
  },
  SUBMITTED: {
    label: '🔵 Submitted',
    classes: 'bg-blue-900/40 text-blue-400 border border-blue-700/40',
  },
  UNDER_REVIEW: {
    label: '🟣 Under Review',
    classes: 'bg-purple-900/40 text-purple-400 border border-purple-700/40',
  },
  APPROVED: {
    label: '✅ Approved',
    classes: 'bg-green-900/40 text-green-400 border border-green-700/40',
  },
  REJECTED: {
    label: '❌ Rejected',
    classes: 'bg-red-900/40 text-red-400 border border-red-700/40',
  },
  NEEDS_REVISION: {
    label: '🟠 Needs Revision',
    classes: 'bg-orange-900/40 text-orange-400 border border-orange-700/40',
  },
};

interface StatusBadgeProps {
  status: ChangeStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${config.classes}`}>
      {config.label}
    </span>
  );
}
