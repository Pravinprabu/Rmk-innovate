import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/super-admin/dashboard', label: 'Hospitals', icon: '🏥', end: true },
  { to: '/super-admin/analytics', label: 'Global Analytics', icon: '📊' },
  { to: '/super-admin/system-config', label: 'System Configuration', icon: '⚙️' },
  { to: '/super-admin/profile', label: 'Profile', icon: '👤' },
];

export default function SuperAdminSidebar({ onLogout }) {
  return (
    <aside className="w-80 shrink-0 bg-brand-primary min-h-screen flex flex-col py-8 px-5">
      <div className="text-white font-bold text-2xl mb-14 px-2">MediKiosk</div>
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-semibold transition-colors ${
                isActive ? 'bg-white text-brand-primary' : 'text-white/85 hover:bg-white/10'
              }`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="mt-auto px-4 py-3.5 rounded-xl text-base font-semibold text-white/85 hover:bg-white/10 text-left"
      >
        Log out
      </button>
    </aside>
  );
}
