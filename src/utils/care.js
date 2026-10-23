export const dateKeyOf = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const todayKey = () => dateKeyOf(new Date().toISOString());
export const recentDateKeys = (count = 7) => Array.from({ length: count }, (_, index) => {
  const date = new Date(); date.setDate(date.getDate() - (count - index - 1));
  return { key: dateKeyOf(date.toISOString()), date };
});
export const getLatestTemperature = (data, patientId) => data.temperatures.filter((r) => r.patientId === patientId).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0] || null;
export const getTodayVisit = (data, patientId) => data.visits.find((v) => v.patientId === patientId && v.date === todayKey()) || null;
export const getEligibility = (data, patient) => {
  if (patient.status !== 'Admitted') return { eligible: false, state: 'Discharged', reason: 'Patient is no longer admitted', days: 0, evidence: [] };
  const rows = data.temperatures.filter((r) => r.patientId === patient.id).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
  if (!rows.length) return { eligible: false, state: 'Evidence incomplete', reason: 'No temperature readings recorded', days: 0, evidence: [] };
  const threshold = data.settings?.feverThreshold ?? 37.5;
  let count = 0;
  let stoppedByFever = false;
  const evidence = [];
  let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i += 1) {
    const key = dateKeyOf(cursor.toISOString());
    const dayRows = rows.filter((r) => dateKeyOf(r.measuredAt) === key);
    if (!dayRows.length) break;
    if (dayRows.some((r) => r.value > threshold)) { stoppedByFever = true; break; }
    count += 1; evidence.push(...dayRows); cursor.setDate(cursor.getDate() - 1);
  }
  const required = data.settings?.feverFreeDays ?? 3;
  const eligible = count >= required;
  return { eligible, state: eligible ? 'Ready for clinical review' : stoppedByFever ? 'Not ready' : 'Evidence incomplete', reason: eligible ? `${count} consecutive fever-free days` : stoppedByFever ? `Fever recorded after ${count} fever-free day${count === 1 ? '' : 's'}` : `${count} of ${required} complete fever-free days documented`, days: count, evidence };
};
export const formatDate = (value) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
