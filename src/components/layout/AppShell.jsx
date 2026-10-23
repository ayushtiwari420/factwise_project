import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppShell({ currentRole, onRoleChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = ({ '/': 'Facility overview', '/patients': 'Patients', '/nurse-station': 'Nursing observations', '/doctor-rounds': 'Doctor rounds', '/discharge': 'Discharge management', '/analytics': 'Outcomes & reports', '/settings': 'Settings' })[location.pathname] || 'FactWise';

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentRole={currentRole}
      />

      <div className="app-shell__main">
        <TopHeader
          currentRole={currentRole}
          onRoleChange={onRoleChange}
          pageTitle={pageTitle}
        />

        {/* Mobile menu toggle */}
        <button
          className="app-shell__menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <main className="app-shell__content">
          <Outlet context={{ currentRole }} />
        </main>
      </div>
    </div>
  );
}
