import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Thermometer,
  Stethoscope,
  ClipboardCheck,
  BarChart3,
  Settings,
  Activity,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/nurse-station', label: 'Nursing observations', icon: Thermometer },
  { path: '/doctor-rounds', label: 'Doctor rounds', icon: Stethoscope },
  { path: '/discharge', label: 'Discharge management', icon: ClipboardCheck },
  { path: '/analytics', label: 'Outcomes & reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const roleAccess = {
  admin: navItems.map((item) => item.path),
  nurse: ['/', '/patients', '/nurse-station'],
  doctor: ['/', '/patients', '/doctor-rounds'],
  discharge_coordinator: ['/', '/patients', '/discharge', '/analytics'],
};

export default function Sidebar({ isOpen, onClose, currentRole = 'admin' }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Logo area */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__product-name">FactWise</span>
            <span className="sidebar__facility-name">Quarantine Care</span>
          </div>
          <button
            className="sidebar__close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navItems.filter(({ path }) => roleAccess[currentRole]?.includes(path)).map(({ path, label, icon: Icon }) => {
            const isActive =
              path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(path);

            return (
              <NavLink
                key={path}
                to={path}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Facility status */}
        <div className="sidebar__footer">
          <div className="sidebar__facility-status">
            <div className="sidebar__status-dot sidebar__status-dot--active" />
            <div>
              <div className="sidebar__status-label">City General Hospital</div>
              <div className="sidebar__status-meta">Ward B · Floor 3</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
