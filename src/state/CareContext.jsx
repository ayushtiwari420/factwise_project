import { useEffect, useMemo, useState } from 'react';
import { CareContext } from './careContextValue';

const STORAGE_KEY = 'factwise-care-v1';
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = () => dateKey(new Date());

function makeSeed() {
  const date = today();
  const patients = [
    ['FW-2041', 'Amara Okafor', 'B-301', '2026-10-17', 'Admitted'],
    ['FW-2042', 'Daniel Kim', 'B-302', '2026-10-18', 'Admitted'],
    ['FW-2043', 'Priya Sharma', 'B-303', '2026-10-15', 'Admitted'],
    ['FW-2044', 'Mateo Alvarez', 'B-304', '2026-10-20', 'Admitted'],
    ['FW-2045', 'Grace Mensah', 'B-305', '2026-10-16', 'Admitted'],
    ['FW-2046', 'Noah Williams', 'B-306', '2026-10-19', 'Admitted'],
    ['FW-2047', 'Zara Haddad', 'B-307', '2026-10-13', 'Admitted'],
    ['FW-2048', 'Ethan Chen', 'B-308', '2026-10-21', 'Admitted'],
  ].map(([id, name, room, admittedAt, status], i) => ({ id, name, room, admittedAt, status, age: [34, 52, 28, 41, 63, 37, 46, 24][i], sex: ['F', 'M', 'F', 'M', 'F', 'M', 'F', 'M'][i] }));
  const temps = patients.flatMap((p, i) => {
    if (i === 3 || i === 7) return [];
    const base = { id: `T-${i}-1`, patientId: p.id, value: [37.1, 38.2, 36.8, 37.4, 36.9, 37.7, 36.7, 0][i], measuredAt: `${date}T${i % 2 ? '08:40' : '07:55'}:00`, note: '' };
    if (i !== 6) return [base];
    const current = new Date(`${date}T12:00:00`);
    return [base, ...[1, 2].map((offset) => { const d = new Date(current); d.setDate(d.getDate() - offset); return { ...base, id: `T-${i}-${offset + 1}`, measuredAt: `${dateKey(d)}T08:00:00` }; })];
  });
  const visits = patients.filter((_, i) => [0, 2, 4, 6].includes(i)).map((p, i) => ({ id: `V-${i}`, patientId: p.id, date, recordedAt: `${date}T08:15:00`, status: i === 2 ? 'Completed' : 'Pending', notes: '', plan: '' }));
  return { patients, temperatures: temps, visits, discharges: [], settings: { capacity: 74, feverThreshold: 37.5, feverFreeDays: 3 }, lastSeedDate: date };
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.patients) && Array.isArray(parsed.temperatures) && Array.isArray(parsed.visits)) {
        const defaults = makeSeed();
        return { ...defaults, ...parsed, discharges: Array.isArray(parsed.discharges) ? parsed.discharges : [], settings: { ...defaults.settings, ...(parsed.settings || {}) } };
      }
    }
  } catch { /* corrupted or unavailable storage falls back to demo data */ }
  return makeSeed();
}

export function CareProvider({ children }) {
  const [data, setData] = useState(readStore);
  const [toast, setToast] = useState(null);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage may be disabled */ } }, [data]);
  useEffect(() => { if (!toast) return undefined; const id = setTimeout(() => setToast(null), 3200); return () => clearTimeout(id); }, [toast]);
  const notify = (message, tone = 'success') => setToast({ message, tone, key: Date.now() });
  const update = (fn) => setData((current) => fn(current));
  const recordTemperature = (patientId, value, note = '', measuredAt = new Date().toISOString()) => update((d) => ({ ...d, temperatures: [{ id: `T-${Date.now()}`, patientId, value: Number(value), measuredAt: new Date(measuredAt).toISOString(), note }, ...d.temperatures] }));
  const completeVisit = (patientId, notes, plan) => update((d) => ({ ...d, visits: [{ id: `V-${Date.now()}`, patientId, date: today(), recordedAt: new Date().toISOString(), status: 'Completed', notes, plan }, ...d.visits.filter((v) => !(v.patientId === patientId && v.date === today()))] }));
  const addPatient = (patient) => update((d) => ({ ...d, patients: [{ ...patient, status: 'Admitted' }, ...d.patients] }));
  const dischargePatient = (patientId) => update((d) => ({ ...d, patients: d.patients.map((p) => p.id === patientId ? { ...p, status: 'Discharged' } : p), discharges: [{ patientId, date: today(), outcome: 'Discharged' }, ...d.discharges] }));
  const resetDemo = () => { setData(makeSeed()); notify('Demo data has been reset'); };
  const value = useMemo(() => ({ data, update, notify, toast, clearToast: () => setToast(null), recordTemperature, completeVisit, addPatient, dischargePatient, resetDemo }), [data, toast]);
  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}
