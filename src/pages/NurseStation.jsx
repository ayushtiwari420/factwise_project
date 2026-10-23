import { useMemo, useState } from 'react';
import { Search, Thermometer, UserRound, Clock3 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { useCare } from '../state/careContextValue';
import { dateKeyOf, formatDate, getLatestTemperature, todayKey } from '../utils/care';

const localDateTime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const localDateTimeValue = (value) => { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const isFutureObservation = (value) => new Date(value).getTime() > Date.now();

export default function NurseStation() {
  const { data, recordTemperature, notify } = useCare();
  const [patientId, setPatientId] = useState('');
  const [query, setQuery] = useState('');
  const [temp, setTemp] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [correcting, setCorrecting] = useState(false);
  const [measuredAt, setMeasuredAt] = useState(localDateTime);
  const patients = data.patients.filter((p) => p.status === 'Admitted');
  const filtered = useMemo(() => patients.filter((p) => `${p.name} ${p.id} ${p.room}`.toLowerCase().includes(query.toLowerCase())), [patients, query]);
  const patient = patients.find((p) => p.id === patientId) || null;
  const records = patient ? data.temperatures.filter((r) => r.patientId === patient.id).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)) : [];
  const selectedDate = dateKeyOf(measuredAt);
  const hasObservationForDate = records.some((r) => dateKeyOf(r.measuredAt) === selectedDate);
  const today = todayKey();
  const todayRecorded = records.some((r) => dateKeyOf(r.measuredAt) === today);

  const selectPatient = (id) => {
    setPatientId(id);
    setTemp(''); setNote(''); setError(''); setCorrecting(false); setMeasuredAt(localDateTime());
  };

  const submit = (event) => {
    event.preventDefault();
    const value = Number(temp);
    const timestamp = new Date(measuredAt);
    if (!patient) { setError('Select a patient before saving an observation.'); return; }
    if (!Number.isFinite(value) || value < 32 || value > 43) { setError('Enter a temperature between 32.0 and 43.0 °C.'); return; }
    if (!measuredAt || Number.isNaN(timestamp.getTime()) || isFutureObservation(measuredAt)) { setError('Enter a valid observation date and time that is not in the future.'); return; }
    if (hasObservationForDate && !correcting) { setError(`An observation is already recorded for ${formatDate(selectedDate)}. Review history or choose correction.`); return; }
    if (correcting && !note.trim()) { setError('Enter a correction reason so the change is documented.'); return; }
    recordTemperature(patient.id, value, correcting ? `Correction: ${note.trim()}` : note.trim(), timestamp.toISOString());
    notify(correcting ? `Temperature correction saved for ${patient.name}` : `Temperature recorded for ${patient.name}`);
    setTemp(''); setNote(''); setError(''); setCorrecting(false); setMeasuredAt(localDateTime());
  };

  const startCorrection = () => {
    const latest = records.find((r) => dateKeyOf(r.measuredAt) === today);
    if (!latest) return;
    setCorrecting(true); setTemp(String(latest.value)); setMeasuredAt(localDateTimeValue(latest.measuredAt)); setNote(''); setError('');
  };
  const doneToday = patients.filter((p) => data.temperatures.some((r) => r.patientId === p.id && dateKeyOf(r.measuredAt) === today)).length;

  return <>
    <PageHeader title="Nursing observations" description="Record dated temperature observations and review each patient's history." />
    <div className="nurse-layout">
      <section className="nurse-main">
        <Card title="Select a patient">
          <label className="search-control search-control--wide"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient name, ID, or room" aria-label="Search admitted patients" /></label>
          <div className="patient-picker">{filtered.map((p) => { const latest = getLatestTemperature(data, p.id); const checked = latest && dateKeyOf(latest.measuredAt) === today; return <button key={p.id} onClick={() => selectPatient(p.id)} className={`patient-picker__row ${patientId === p.id ? 'is-selected' : ''}`}><span className="avatar"><UserRound size={17} /></span><span className="patient-picker__identity"><strong>{p.name}</strong><small>{p.id} · {p.room}</small></span><span className="patient-picker__temp">{latest ? `${latest.value.toFixed(1)} °C` : 'No reading'}</span><StatusBadge>{checked ? 'Recorded' : 'Not recorded'}</StatusBadge></button>; })}{filtered.length === 0 && <div className="empty-state empty-state--compact">No admitted patients match this search.</div>}</div>
        </Card>
        {patient && <Card title={correcting ? 'Correct observation' : 'Record temperature'} className="record-card">
          <div className="selected-summary"><span className="metric-icon metric-icon--teal"><UserRound size={18} /></span><span><strong>{patient.name}</strong><small>{patient.id} · Room {patient.room}</small></span><span className="selected-summary__latest">Latest: <b>{getLatestTemperature(data, patient.id)?.value?.toFixed(1) || '—'} °C</b></span></div>
          {hasObservationForDate && !correcting && <div className="notice notice--info"><Thermometer size={17} /><span>An observation already exists for {formatDate(selectedDate)}. A correction is saved as a new history entry; the original remains visible.</span></div>}
          {todayRecorded && !correcting && <div className="correction-action"><Button variant="outline" size="sm" onClick={startCorrection}>Correct today's observation</Button></div>}
          <form className="temperature-form" onSubmit={submit}>
            <label className="form-field"><span>Temperature <b>*</b></span><div className="unit-input"><input type="number" min="32" max="43" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="36.8" required /><span>°C</span></div><small>Degrees Celsius · accepted range 32.0–43.0 °C</small></label>
            <label className="form-field"><span>Observation date and time <b>*</b></span><input type="datetime-local" value={measuredAt} max={localDateTime()} onChange={(e) => setMeasuredAt(e.target.value)} required disabled={correcting} /></label>
            <label className="form-field"><span>{correcting ? 'Correction reason' : 'Observation note'}</span><textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder={correcting ? 'Explain why this observation is being corrected' : 'Optional clinical context'} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions">{correcting && <Button variant="outline" onClick={() => { setCorrecting(false); setTemp(''); setNote(''); setError(''); setMeasuredAt(localDateTime()); }}>Cancel correction</Button>}<Button type="submit" icon={Thermometer}>{correcting ? 'Save correction' : 'Save observation'}</Button></div>
          </form>
        </Card>}
      </section>
      <aside className="nurse-aside">
        <Card title="Today's observation status"><div className="progress-number"><strong>{doneToday}</strong><span> / {patients.length} patients observed</span></div><div className="occupancy-track"><span style={{ width: `${patients.length ? doneToday / patients.length * 100 : 0}%` }} /></div><p className="muted-copy">One or more dated observations count as today's completed check.</p><div className="checklist-status"><StatusBadge tone="warning">{patients.length - doneToday} due today</StatusBadge></div></Card>
        <Card title={patient ? `Observation history · ${patient.name.split(' ')[0]}` : 'Observation history'}><div className="history-list">{records.slice(0, 10).map((r) => <div key={r.id}><span><Clock3 size={14} />{formatDate(r.measuredAt)} · {r.measuredAt.slice(11, 16)}{r.note?.startsWith('Correction:') ? ' · corrected' : ''}</span><strong className={r.value > data.settings.feverThreshold ? 'temperature-hot' : ''}>{r.value.toFixed(1)} °C</strong></div>)}{records.length === 0 && <p className="muted-copy">Select a patient to see dated observations.</p>}</div></Card>
      </aside>
    </div>
  </>;
}
