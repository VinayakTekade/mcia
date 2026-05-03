import type { ReviewComment } from './types';

interface CommentsPanelProps {
  comments: ReviewComment[];
}

export default function CommentsPanel({ comments }: CommentsPanelProps) {
  if (comments.length === 0) {
    return (
      <div className="py-6 text-center text-gray-600 text-sm">
        No review comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => {
        const isOptimistic = c.id.startsWith('optimistic-');
        return (
          <div
            key={c.id}
            className={`rounded-lg px-4 py-3 border transition-opacity ${
              isOptimistic
                ? 'bg-surface-700/50 border-surface-600 opacity-60'
                : 'bg-surface-700 border-surface-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-400 font-mono">
                {isOptimistic ? 'you (saving...)' : c.authorId}
              </span>
              <span className="text-xs text-gray-600">
                {isOptimistic ? 'just now' : new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{c.content}</p>
          </div>
        );
      })}
    </div>
  );
}
