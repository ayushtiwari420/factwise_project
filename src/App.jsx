import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { CareProvider } from './state/CareContext';
import { useCare } from './state/careContextValue';
import Toast from './components/ui/Toast';
import LoadingState from './components/ui/LoadingState';

const Overview = lazy(() => import('./pages/Overview'));
const Patients = lazy(() => import('./pages/Patients'));
const NurseStation = lazy(() => import('./pages/NurseStation'));
const DoctorRounds = lazy(() => import('./pages/DoctorRounds'));
const Discharge = lazy(() => import('./pages/Discharge'));
const Analytics = lazy(() => import('./pages/Analytics'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function AppContent() {
  const { toast, clearToast } = useCare();
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return localStorage.getItem('fw_role') || 'admin';
    } catch {
      return 'admin';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fw_role', currentRole);
    } catch {
      // localStorage unavailable
    }
  }, [currentRole]);

  return <>
    <BrowserRouter>
      <Suspense fallback={<LoadingState label="Loading care workspace" />}>
      <Routes>
        <Route
          element={
            <AppShell
              currentRole={currentRole}
              onRoleChange={setCurrentRole}
            />
          }
        >
          <Route path="/" element={<Overview />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/nurse-station" element={<NurseStation />} />
          <Route path="/doctor-rounds" element={<DoctorRounds />} />
          <Route path="/discharge" element={<Discharge />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
    <Toast toast={toast} onClose={clearToast} />
  </>;
}

function App() { return <CareProvider><AppContent /></CareProvider>; }

export default App;
