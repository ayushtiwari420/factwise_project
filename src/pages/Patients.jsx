import { useMemo, useState } from 'react';
import { Plus, Search, UserRound, Eye, ArrowUpDown, Activity, Thermometer, Stethoscope } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { useCare } from '../state/careContextValue';
import { useOutletContext } from 'react-router-dom';
import { dateKeyOf, formatDate, getEligibility, getLatestTemperature, getTodayVisit, todayKey } from '../utils/care';

export default function Patients() {
  const { currentRole = 'admin' } = useOutletContext() || {};
  const { data, addPatient, notify } = useCare();
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('All'); const [obsFilter, setObsFilter] = useState('All'); const [visitFilter, setVisitFilter] = useState('All'); const [sortNewest, setSortNewest] = useState(true);
  const [selected, setSelected] = useState(null); const [adding, setAdding] = useState(false); const [error, setError] = useState('');
  const [form, setForm] = useState({ id: '', name: '', room: '', age: '', sex: 'F', admittedAt: todayKey() });
  const today = todayKey();
  const list = useMemo(() => data.patients.filter((p) => {
    const latest = getLatestTemperature(data, p.id); const seen = latest && dateKeyOf(latest.measuredAt) === today;
    const visit = getTodayVisit(data, p.id); const visited = visit?.status === 'Completed';
    return (status === 'All' || p.status === status) && (obsFilter === 'All' || (obsFilter === 'Recorded' ? seen : !seen)) && (visitFilter === 'All' || (visitFilter === 'Completed' ? visited : !visited)) && `${p.name} ${p.id} ${p.room}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => sortNewest ? b.admittedAt.localeCompare(a.admittedAt) : a.admittedAt.localeCompare(b.admittedAt)), [data, query, status, obsFilter, visitFilter, sortNewest, today]);
  const save = (event) => {
    event.preventDefault(); const id = form.id.trim().toUpperCase(); const room = form.room.trim();
    if (!id || !form.name.trim() || !room) { setError('Enter the patient ID, name, and room.'); return; }
    if (data.patients.some((p) => p.id.toLowerCase() === id.toLowerCase())) { setError('That patient ID is already in use.'); return; }
    if (data.patients.filter((p) => p.status === 'Admitted').length >= data.settings.capacity) { setError('The ward is at capacity. Discharge a patient or update capacity before admitting another.'); return; }
    if (data.patients.some((p) => p.room.toLowerCase() === room.toLowerCase() && p.status === 'Admitted')) { setError('That bed is already occupied.'); return; }
    addPatient({ ...form, id, name: form.name.trim(), room, age: Number(form.age) || null }); setAdding(false); setForm({ id: '', name: '', room: '', age: '', sex: 'F', admittedAt: todayKey() }); setError(''); notify('Patient admitted successfully');
  };
  const clearFilters = () => { setQuery(''); setStatus('All'); setObsFilter('All'); setVisitFilter('All'); };

  return <>
    <PageHeader title="Patients" description="Search the registry and review each patient's care record.">{currentRole === 'admin' && <Button icon={Plus} onClick={() => { setAdding(true); setError(''); }}>Admit patient</Button>}</PageHeader>
    <Card className="registry-card">
      <div className="filter-bar"><label className="search-control"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, patient ID, or room" aria-label="Search patients" /></label>
        <label className="select-control"><span>Patient</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Admitted</option><option>Discharged</option></select></label>
        <label className="select-control"><span>Observation</span><select value={obsFilter} onChange={(e) => setObsFilter(e.target.value)}><option>All</option><option>Recorded</option><option>Due</option></select></label>
        <label className="select-control"><span>Doctor review</span><select value={visitFilter} onChange={(e) => setVisitFilter(e.target.value)}><option>All</option><option>Completed</option><option>Pending</option></select></label>
        <button className="filter-clear" onClick={clearFilters}>Clear</button><span className="result-count">{list.length} patients</span>
      </div>
      <div className="responsive-table"><table className="care-table"><thead><tr><th>Patient</th><th>Room / bed</th><th><button className="table-sort" onClick={() => setSortNewest(!sortNewest)}>Admission <ArrowUpDown size={13}/></button></th><th>Latest temperature</th><th>Nursing observation</th><th>Doctor review</th><th>Fever-free days</th><th>Readiness</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{list.map((p) => { const temp = getLatestTemperature(data, p.id); const visit = getTodayVisit(data, p.id); const readiness = getEligibility(data, p); const seen = temp && dateKeyOf(temp.measuredAt) === today; return <tr key={p.id}><td><div className="patient-cell"><span className="avatar"><UserRound size={17} /></span><span><strong>{p.name}</strong><small>{p.id}</small></span></div></td><td>{p.room}</td><td>{formatDate(p.admittedAt)}</td><td>{temp ? <span className={temp.value > data.settings.feverThreshold ? 'temperature-hot' : ''}>{temp.value.toFixed(1)} °C</span> : '—'}</td><td><StatusBadge>{seen ? 'Recorded' : 'Due today'}</StatusBadge></td><td><StatusBadge>{visit?.status || 'Pending'}</StatusBadge></td><td>{p.status === 'Admitted' ? `${readiness.days} / ${data.settings.feverFreeDays}` : '—'}</td><td><StatusBadge>{p.status === 'Discharged' ? 'Discharged' : readiness.state}</StatusBadge></td><td><button className="row-action" aria-label={`Open record for ${p.name}`} onClick={() => setSelected(p)}><Eye size={17} /></button></td></tr>; })}</tbody></table>{list.length === 0 && <div className="empty-state"><UserRound size={26} /><strong>No matching patients</strong><span>Adjust or clear the filters to see more records.</span></div>}</div>
    </Card>
    <Modal open={adding} onClose={() => setAdding(false)} title="Admit patient" footer={<><Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" form="patient-form">Admit patient</Button></>}>
      <form id="patient-form" className="form-grid" onSubmit={save}><label className="form-field"><span>Patient ID <b>*</b></span><input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="FW-2050" autoFocus required /></label><label className="form-field"><span>Full name <b>*</b></span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fictional patient name" required /></label><label className="form-field"><span>Room / bed <b>*</b></span><input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="B-309" required /></label><label className="form-field"><span>Age</span><input type="number" min="0" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></label><label className="form-field"><span>Admission date</span><input type="date" value={form.admittedAt} max={today} onChange={(e) => setForm({ ...form, admittedAt: e.target.value })} /></label>{error && <p className="form-error form-grid__full" role="alert">{error}</p>}</form>
    </Modal>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Patient record" wide>
      {selected && (() => { const latest = getLatestTemperature(data, selected.id); const readiness = getEligibility(data, selected); const patientTemps = data.temperatures.filter((r) => r.patientId === selected.id).sort((a,b) => b.measuredAt.localeCompare(a.measuredAt)); const visits = data.visits.filter((v) => v.patientId === selected.id).sort((a,b) => (b.recordedAt || b.date).localeCompare(a.recordedAt || a.date)); const discharge = data.discharges.find((d) => d.patientId === selected.id); return <>
        <div className="detail-head"><span className="avatar avatar--large"><UserRound size={22} /></span><div><h3>{selected.name}</h3><p>{selected.id} · Room {selected.room} · Admitted {formatDate(selected.admittedAt)}</p></div><StatusBadge>{selected.status}</StatusBadge></div>
        <div className="detail-grid"><div><small>Latest observation</small><strong><Thermometer size={15}/>{latest ? `${latest.value.toFixed(1)} °C · ${formatDate(latest.measuredAt)}` : 'None recorded'}</strong></div><div><small>Today's doctor review</small><strong><Stethoscope size={15}/>{getTodayVisit(data, selected.id)?.status || 'Pending'}</strong></div><div><small>Readiness rule</small><strong><Activity size={15}/>{readiness.reason}</strong></div><div><small>Discharge record</small><strong>{discharge ? formatDate(discharge.date) : 'No discharge recorded'}</strong></div></div>
        <div className="record-columns"><section><h4 className="subsection-title">Nursing observations</h4><div className="history-list">{patientTemps.slice(0, 8).map((r) => <div key={r.id}><span>{formatDate(r.measuredAt)} · {r.measuredAt.slice(11,16)}{r.note ? ` · ${r.note}` : ''}</span><strong className={r.value > data.settings.feverThreshold ? 'temperature-hot' : ''}>{r.value.toFixed(1)} °C</strong></div>)}{!patientTemps.length && <p className="muted-copy">No observations recorded.</p>}</div></section><section><h4 className="subsection-title">Doctor visits</h4><div className="history-list">{visits.slice(0, 8).map((v) => <div key={v.id}><span>{formatDate(v.recordedAt || v.date)} · {v.notes || 'Visit recorded'}</span><StatusBadge>{v.status}</StatusBadge></div>)}{!visits.length && <p className="muted-copy">No doctor visits recorded.</p>}</div></section></div>
      </>; })()}
    </Modal>
  </>;
}
