import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChangeRequest, useImpactReport, useSubmitChange } from '../features/change-request/hooks';
import StatusBadge from '../features/change-request/StatusBadge';
import CommentsPanel from '../features/change-request/CommentsPanel';
import ApprovalActionBar from '../features/change-request/ApprovalActionBar';
import ImpactSummaryCard from '../features/change-request/ImpactSummaryCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ChangeRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const {
    data: cr,
    isLoading,
    isError,
    error,
  } = useChangeRequest(id);

  const { data: impact } = useImpactReport(id);
  const submitChange = useSubmitChange();

  // ---- Loading / Error states ----
  if (isLoading) {
    return <LoadingSpinner message="Loading change request..." />;
  }

  if (isError || !cr) {
    const errMsg = (error as { message?: string })?.message ?? 'Unknown error';
    return (
      <div className="card text-center py-12 max-w-lg mx-auto">
        <p className="text-red-400 font-medium text-lg">Failed to load change request</p>
        <p className="text-gray-600 text-sm mt-2">{errMsg}</p>
        <Link to="/changes" className="btn-secondary mt-4 inline-block">
          ← Back to list
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === cr.authorId;
  const canSubmit =
    isAuthor && (cr.status === 'DRAFT' || cr.status === 'NEEDS_REVISION');

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/changes" className="text-xs text-gray-500 hover:text-brand-500 transition-colors">
          ← Change Requests
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white leading-snug">{cr.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={cr.status} />
            <span className="text-xs text-gray-500 font-mono bg-surface-700 px-2 py-0.5 rounded">
              {cr.changeType.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-600">
              {new Date(cr.createdAt).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {canSubmit && (
          <button
            onClick={() => submitChange.mutate(cr.id)}
            disabled={submitChange.isPending}
            className="btn-primary flex-shrink-0"
          >
            {submitChange.isPending ? 'Submitting...' : '🚀 Submit for Review'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Change Details
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm">{cr.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-surface-600">
              <div>
                <p className="text-xs text-gray-500 mb-1">Target Service</p>
                <span className="text-sm font-mono text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded">
                  {cr.targetServiceId}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Author</p>
                <span className="text-sm font-mono text-gray-300">{cr.authorId}</span>
              </div>
              {cr.reviewerId && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reviewer</p>
                  <span className="text-sm font-mono text-gray-300">{cr.reviewerId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Review History */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Review History ({cr.comments.length})
            </h2>
            <CommentsPanel comments={cr.comments} />
          </div>

          {/* Approval Action Bar — only rendered for eligible reviewers */}
          {user && (
            <ApprovalActionBar
              changeRequestId={cr.id}
              status={cr.status}
              userRole={user.role}
            />
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Impact Summary */}
          {impact ? (
            <ImpactSummaryCard summary={impact} changeRequestId={cr.id} />
          ) : (
            <div className="card text-center py-6">
              <p className="text-gray-500 text-sm font-medium">No Impact Report Yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Submit this change request to trigger automated analysis.
              </p>
              <Link
                to={`/impact/${cr.id}`}
                className="text-xs text-brand-500 hover:underline block mt-2"
              >
                View report page
              </Link>
            </div>
          )}

          {/* Metadata */}
          <div className="card space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Metadata
            </h3>
            {[
              { label: 'ID', value: cr.id.slice(0, 8) + '...', mono: true },
              { label: 'Created', value: new Date(cr.createdAt).toLocaleDateString() },
              { label: 'Updated', value: new Date(cr.updatedAt).toLocaleString() },
              ...(cr.blastRadius != null
                ? [{ label: 'Blast Radius', value: String(cr.blastRadius), mono: true }]
                : []),
            ].map(item => (
              <div key={item.label} className="flex justify-between text-xs py-1.5 border-b border-surface-600 last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className={item.mono ? 'font-mono text-gray-300' : 'text-gray-300'}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
