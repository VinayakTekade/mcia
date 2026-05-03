import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.list(user?.id || ''),
    enabled: !!user?.id,
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data || [];
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">{unread} unread</p>
      </div>

      {isLoading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You'll see events here once the system generates them." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id}
              className={`card flex items-start justify-between gap-4 transition-opacity ${n.isRead ? 'opacity-60' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                  <p className="text-sm font-medium text-gray-200">{n.title}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead.mutate(n.id)} className="text-xs text-brand-500 hover:underline flex-shrink-0">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
