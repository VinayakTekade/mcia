import { useAuthStore } from '../../store/authStore';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-400',
  ARCHITECT: 'bg-purple-500/20 text-purple-400',
  RELEASE_MANAGER: 'bg-blue-500/20 text-blue-400',
  DEVELOPER: 'bg-green-500/20 text-green-400',
};

export default function TopBar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-surface-800 border-b border-surface-600 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold text-white">M</div>
        <span className="text-sm font-semibold text-gray-200 hidden sm:block">Change Impact Analyzer</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-200">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[user.role] || 'bg-gray-700 text-gray-300'}`}>
              {user.role.replace('_', ' ')}
            </span>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-400 transition-colors text-sm"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
