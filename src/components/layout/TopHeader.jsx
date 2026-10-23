import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Calendar, Building2 } from 'lucide-react';

const roles = [
  { id: 'admin', label: 'Administrator' },
  { id: 'nurse', label: 'Nurse' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'discharge_coordinator', label: 'Discharge coordinator' },
];
const formatCurrentDate = () => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

export default function TopHeader({ currentRole, onRoleChange, pageTitle, breadcrumb }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const roleMenuRef = useRef(null);
  const notifRef = useRef(null);

  const currentRoleLabel = roles.find(r => r.id === currentRole)?.label || 'Administrator';
  const today = formatCurrentDate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-header">
      <div className="top-header__left">
        <span className="top-header__facility-icon"><Building2 size={17}/></span>
        <span className="top-header__facility-name">City General Hospital</span>
        <span className="top-header__context-divider">/</span>
        <span className="top-header__page-context">{breadcrumb || pageTitle || 'Care operations'}</span>
      </div>

      <div className="top-header__right">
        {/* Date */}
        <div className="top-header__date">
          <Calendar size={14} />
          <span>{today}</span>
        </div>

        {/* Notifications */}
        <div className="top-header__notif-wrapper" ref={notifRef}>
          <button
            className="top-header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="top-header__notif-badge">3</span>
          </button>
          {showNotifications && (
            <div className="top-header__dropdown top-header__notif-panel">
              <div className="top-header__dropdown-header">Notifications</div>
              <div className="top-header__notif-item">
                <span className="top-header__notif-dot top-header__notif-dot--warning" />
                <div>
                  <div className="top-header__notif-text">3 temperature checks pending</div>
                  <div className="top-header__notif-time">Just now</div>
                </div>
              </div>
              <div className="top-header__notif-item">
                <span className="top-header__notif-dot top-header__notif-dot--info" />
                <div>
                  <div className="top-header__notif-text">2 patients eligible for discharge</div>
                  <div className="top-header__notif-time">10 min ago</div>
                </div>
              </div>
              <div className="top-header__notif-item">
                <span className="top-header__notif-dot top-header__notif-dot--danger" />
                <div>
                  <div className="top-header__notif-text">1 doctor visit overdue</div>
                  <div className="top-header__notif-time">25 min ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role selector */}
        <div className="top-header__role-wrapper" ref={roleMenuRef}>
          <button
            className="top-header__role-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
          >
            <div className="top-header__role-avatar">
              {currentRoleLabel.charAt(0)}
            </div>
            <span className="top-header__role-label">{currentRoleLabel}</span>
            <ChevronDown size={14} />
          </button>
          {showRoleMenu && (
            <div className="top-header__dropdown top-header__role-menu">
              <div className="top-header__dropdown-header">Demo role</div>
              {roles.map(role => (
                <button
                  key={role.id}
                  className={`top-header__role-option ${role.id === currentRole ? 'top-header__role-option--active' : ''}`}
                  onClick={() => {
                    onRoleChange(role.id);
                    setShowRoleMenu(false);
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
