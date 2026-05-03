import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { changesApi } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import type { ChangeRequest } from '../types';

export default function ReviewQueuePage() {
  const qc = useQueryClient();
  const [reviewState, setReviewState] = useState<Record<string, { action: string; comment: string }>>({});

  const { data, isLoading } = useQuery<ChangeRequest[]>({
    queryKey: ['changes'],
    queryFn: changesApi.list,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => changesApi.review(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['changes'] }),
  });

  const pending = (data || []).filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Review Queue</h1>
        <p className="text-gray-500 text-sm mt-1">{pending.length} change requests awaiting review</p>
      </div>

      {isLoading ? <LoadingSpinner /> : pending.length === 0 ? (
        <EmptyState title="No pending reviews" description="All change requests have been processed." />
      ) : (
        <div className="space-y-4">
          {pending.map((cr) => {
            const state = reviewState[cr.id] || { action: 'APPROVE', comment: '' };
            return (
              <div key={cr.id} className="card space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/changes/${cr.id}`} className="font-semibold text-white hover:text-brand-500 transition-colors">{cr.title}</Link>
                    <p className="text-xs text-gray-500 mt-1">{cr.targetServiceId} · {cr.changeType.replace(/_/g, ' ')}</p>
                  </div>
                  <Link to={`/impact/${cr.id}`} className="text-xs text-brand-500 hover:underline flex-shrink-0">View Impact →</Link>
                </div>
                <textarea
                  className="input resize-none text-sm" rows={2}
                  placeholder="Add a review comment..."
                  value={state.comment}
                  onChange={e => setReviewState(s => ({ ...s, [cr.id]: { ...state, comment: e.target.value } }))}
                />
                <div className="flex gap-2">
                  {['APPROVE', 'REJECT', 'NEEDS_REVISION'].map(action => (
                    <button
                      key={action}
                      onClick={() => reviewMutation.mutate({ id: cr.id, payload: { action, comment: state.comment || `Status: ${action}` } })}
                      disabled={reviewMutation.isPending}
                      className={action === 'APPROVE' ? 'btn-primary text-sm' : action === 'REJECT' ? 'btn-danger text-sm' : 'btn-secondary text-sm'}
                    >
                      {action.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
