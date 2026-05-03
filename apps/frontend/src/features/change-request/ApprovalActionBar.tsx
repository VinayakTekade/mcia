import { useState } from 'react';
import { useReviewChange } from './hooks';
import type { ChangeStatus } from '../../types';
import type { ReviewAction } from './types';

interface ApprovalActionBarProps {
  changeRequestId: string;
  status: ChangeStatus;
  userRole: string;
}

const REVIEWER_ROLES = ['ARCHITECT', 'RELEASE_MANAGER', 'ADMIN'];

const ACTION_CONFIG: { action: ReviewAction; label: string; className: string }[] = [
  { action: 'APPROVE', label: '✅ Approve', className: 'btn-primary' },
  { action: 'REJECT', label: '❌ Reject', className: 'btn-danger' },
  { action: 'NEEDS_REVISION', label: '🔄 Request Revision', className: 'btn-secondary' },
];

export default function ApprovalActionBar({ changeRequestId, status, userRole }: ApprovalActionBarProps) {
  const { mutate: review, isPending } = useReviewChange();
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const canReview =
    REVIEWER_ROLES.includes(userRole) &&
    (status === 'SUBMITTED' || status === 'UNDER_REVIEW');

  if (!canReview) return null;

  const handleAction = (action: ReviewAction) => {
    if (!comment.trim()) {
      setCommentError('Comment is required before submitting a review decision.');
      return;
    }
    setCommentError('');
    review(
      { id: changeRequestId, payload: { action, comment: comment.trim() } },
      { onSuccess: () => setComment('') }
    );
  };

  return (
    <div className="card border-brand-500/30 bg-surface-700/50 space-y-3">
      <h3 className="text-sm font-semibold text-white">Submit Review Decision</h3>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          if (commentError) setCommentError('');
        }}
        placeholder="Write your review comment..."
        className="input resize-none text-sm"
      />
      {commentError && <p className="text-red-400 text-xs">{commentError}</p>}

      <div className="flex flex-wrap gap-2">
        {ACTION_CONFIG.map(({ action, label, className }) => (
          <button
            key={action}
            type="button"
            disabled={isPending}
            onClick={() => handleAction(action)}
            className={`${className} text-sm disabled:opacity-50`}
          >
            {isPending ? '...' : label}
          </button>
        ))}
      </div>
    </div>
  );
}
