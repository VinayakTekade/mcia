import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { to: '/services', label: 'Service Registry', icon: '🗂' },
  { to: '/dependencies', label: 'Dependency Map', icon: '🔗' },
  { to: '/changes', label: 'Change Requests', icon: '📝' },
  { to: '/review', label: 'Review Queue', icon: '🔍', roles: ['ARCHITECT', 'RELEASE_MANAGER', 'ADMIN'] },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/admin', label: 'Admin Settings', icon: '⚙️', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const role = user?.role || '';

  const visibleItems = navItems.filter(
    item => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="w-60 bg-surface-800 border-r border-surface-600 flex flex-col flex-shrink-0 overflow-y-auto">
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 px-3 py-2">Main</p>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-600">
        <p className="text-xs text-gray-600 text-center">MCIA v1.0.0</p>
      </div>
    </aside>
  );
}
