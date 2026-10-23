import { useState } from 'react';
import { Stethoscope, Thermometer, ClipboardCheck, AlertTriangle, UserRound, Clock3 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { useCare } from '../state/careContextValue';
import { dateKeyOf, formatDate, getLatestTemperature, getTodayVisit, todayKey } from '../utils/care';

export default function DoctorRounds() {
  const { data, completeVisit, notify } = useCare();
  const [selectedId, setSelectedId] = useState(''); const [notes, setNotes] = useState(''); const [plan, setPlan] = useState(''); const [acknowledged, setAcknowledged] = useState(false);
  const today = todayKey(); const active = data.patients.filter((p) => p.status === 'Admitted');
  const selected = active.find((p) => p.id === selectedId);
  const due = active.filter((p) => getTodayVisit(data, p.id)?.status !== 'Completed');
  const completed = active.length - due.length;
  const overdue = data.visits.filter((v) => v.status === 'Pending' && v.date < today && active.some((p) => p.id === v.patientId)).length;
  const temperatureDue = active.filter((p) => dateKeyOf(getLatestTemperature(data, p.id)?.measuredAt) !== today).length;
  const latestVisit = (patientId) => data.visits.filter((v) => v.patientId === patientId && v.status === 'Completed').sort((a, b) => (b.recordedAt || b.date).localeCompare(a.recordedAt || a.date))[0];
  const hasTodayTemperature = (patientId) => dateKeyOf(getLatestTemperature(data, patientId)?.measuredAt) === today;
  const select = (patient) => { const visit = getTodayVisit(data, patient.id); setSelectedId(patient.id); setNotes(visit?.notes || ''); setPlan(visit?.plan || ''); setAcknowledged(false); };
  const submit = (event) => {
    event.preventDefault(); if (!selected) return;
    if (!hasTodayTemperature(selected.id) && !acknowledged) return;
    completeVisit(selected.id, notes.trim(), plan.trim()); notify(`Visit completed for ${selected.name}`);
    setSelectedId(''); setNotes(''); setPlan(''); setAcknowledged(false);
  };
  const metrics = [
    { label: 'Visits due today', value: due.length, icon: Stethoscope, tone: 'amber' },
    { label: 'Visits completed', value: completed, icon: ClipboardCheck, tone: 'green' },
    { label: 'Observations missing', value: temperatureDue, icon: Thermometer, tone: 'blue' },
    { label: 'Overdue reviews', value: overdue, icon: AlertTriangle, tone: overdue ? 'red' : 'green' },
  ];

  return <>
    <PageHeader title="Doctor rounds" description="Review patient observations, document clinical notes, and complete daily visits." />
    <div className="metric-grid metric-grid--compact">{metrics.map(({ label, value, icon: Icon, tone }) => <div className="metric-card metric-card--small" key={label}><div className="metric-card__top"><span>{label}</span><span className={`metric-icon metric-icon--${tone}`}><Icon size={17} /></span></div><strong>{value}</strong></div>)}</div>
    <div className="rounds-layout">
      <Card title="Review queue" action={<span className="count-pill">{due.length} due today</span>}><div className="queue-list">{[...active].sort((a,b) => Number(hasTodayTemperature(b.id)) - Number(hasTodayTemperature(a.id))).map((p) => { const visit = getTodayVisit(data, p.id); const temp = getLatestTemperature(data, p.id); const previous = latestVisit(p.id); const overdueRow = data.visits.some((v) => v.patientId === p.id && v.status === 'Pending' && v.date < today); return <button key={p.id} className={`queue-patient ${selectedId === p.id ? 'is-selected' : ''}`} onClick={() => select(p)}><span className="avatar"><UserRound size={17} /></span><span className="patient-picker__identity"><strong>{p.name}</strong><small>{p.id} · {p.room} · Previous review {previous ? formatDate(previous.recordedAt || previous.date) : 'none'}</small></span><span className="queue-patient__temp"><Thermometer size={14} />{temp ? `${temp.value.toFixed(1)} °C · ${temp.measuredAt.slice(11,16)}` : 'No reading'}</span><StatusBadge>{visit?.status === 'Completed' ? 'Completed' : overdueRow ? 'Overdue' : 'Due today'}</StatusBadge></button>; })}</div></Card>
      <Card title={selected ? `Visit review · ${selected.name}` : 'Visit review'} className="visit-panel">{selected ? <>
        <div className="visit-patient-summary"><strong>{selected.id}</strong><span>Room {selected.room}</span><span>Admitted {formatDate(selected.admittedAt)}</span><span>Last review {latestVisit(selected.id) ? formatDate(latestVisit(selected.id).recordedAt || latestVisit(selected.id).date) : 'None'}</span></div>
        {!hasTodayTemperature(selected.id) && <div className="notice notice--warning"><AlertTriangle size={18} /><span>No nursing observation is recorded today. Review the patient's record before completing this visit.</span></div>}
        <div className="visit-reading"><span>Latest nursing observation</span><strong>{getLatestTemperature(data, selected.id) ? `${getLatestTemperature(data, selected.id).value.toFixed(1)} °C · ${formatDate(getLatestTemperature(data, selected.id).measuredAt)} ${getLatestTemperature(data, selected.id).measuredAt.slice(11,16)}` : 'Not recorded'}</strong></div>
        <div className="recent-observations">{data.temperatures.filter((r) => r.patientId === selected.id).sort((a,b) => b.measuredAt.localeCompare(a.measuredAt)).slice(0,4).map((r) => <span key={r.id}><Clock3 size={13}/>{formatDate(r.measuredAt)} · {r.value.toFixed(1)} °C</span>)}</div>
        <form className="temperature-form" onSubmit={submit}><label className="form-field"><span>Clinical notes</span><textarea rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Patient presentation and assessment" /></label><label className="form-field"><span>Treatment plan</span><textarea rows="3" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Treatment and follow-up instructions" /></label>{!hasTodayTemperature(selected.id) && <label className="checkbox-field"><input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} /><span>I reviewed the missing observation and want to complete this visit.</span></label>}<Button type="submit" icon={ClipboardCheck} disabled={!hasTodayTemperature(selected.id) && !acknowledged}>Complete visit</Button></form>
      </> : <div className="empty-state"><Stethoscope size={27} /><strong>Select a patient to begin</strong><span>Review today's observation and previous visits, then document this assessment.</span></div>}</Card>
    </div>
  </>;
}
