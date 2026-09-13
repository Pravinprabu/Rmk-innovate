import { NavLink } from 'react-router-dom';

// Left-hand nav for both doctor and triage sections -- same shell, just a
// different item list per role (doctor never sees Emergency Token; triage
// never sees the token-search queue). Matches the "Doctor Module" and
// "Triage Worker Role" sidebar specs: Patient Queue + Booked Patients for
// both, Emergency Token added for triage only.
const NAV_ITEMS = {
  doctor: [
    { to: '/staff/doctor', label: 'Patient Queue', icon: '🩺', end: true },
    { to: '/staff/doctor/booked', label: 'Booked Patients', icon: '📅' },
    { to: '/staff/doctor/profile', label: 'Profile', icon: '👤' },
  ],
  triage: [
    { to: '/staff/triage', label: 'Patient Queue', icon: '🩺', end: true },
    { to: '/staff/triage/booked', label: 'Booked Patients', icon: '📅' },
    { to: '/staff/triage/create-token', label: 'Create Token', icon: '🎫' },
    { to: '/staff/triage/emergency', label: 'Emergency Token', icon: '🚨' },
    { to: '/staff/triage/profile', label: 'Profile', icon: '👤' },
  ],
};

export default function StaffSidebar({ role, onLogout }) {
  const items = NAV_ITEMS[role] || [];

  return (
    <aside className="w-80 shrink-0 bg-brand-primary min-h-screen flex flex-col py-8 px-5">
      <div className="text-white font-bold text-2xl mb-14 px-2">MediKiosk</div>
      <nav className="flex-1 space-y-2">
        {items.map((item) => (
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
