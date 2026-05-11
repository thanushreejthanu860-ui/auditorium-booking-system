import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const EQUIPMENT = ['Microphone', 'Speakers', 'Projector', 'WiFi'];
const MEDIA = ['Camera', 'Photography', 'Videography', 'Live Streaming'];

const today = new Date().toISOString().split('T')[0];

export default function NewBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    event_name: '', date: '', start_time: '', end_time: '',
    purpose: '', audience_size: '', equipment: [], media: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.event_name.trim()) e.event_name = 'Event name is required.';
    if (!form.date) e.date = 'Date is required.';
    else if (form.date < today) e.date = 'Cannot book a past date.';
    if (!form.start_time) e.start_time = 'Start time is required.';
    if (!form.end_time) e.end_time = 'End time is required.';
    if (form.start_time && form.end_time && form.start_time >= form.end_time)
      e.end_time = 'End time must be after start time.';
    if (!form.purpose.trim()) e.purpose = 'Purpose is required.';
    if (!form.audience_size) e.audience_size = 'Audience size is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/api/bookings', {
        ...form,
        audience_size: Number(form.audience_size),
      });
      toast.success('Booking submitted successfully!');
      navigate('/bookings/my');
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed.';
      if (err.response?.status === 409) {
        toast.error('Time slot conflict. Please choose a different time.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const F = ({ name, label, children }) => (
    <div className="form-group">
      <label className="form-label">{label} <span className="required">*</span></label>
      {children}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><h2>➕ New Booking Request</h2><p>Submit a new auditorium booking</p></div>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <F name="event_name" label="Event Name">
              <input className={`form-control ${errors.event_name ? 'error' : ''}`} value={form.event_name}
                onChange={e => set('event_name', e.target.value)} placeholder="Annual Tech Fest 2025" />
            </F>

            <div className="form-row">
              <F name="date" label="Date">
                <input type="date" className={`form-control ${errors.date ? 'error' : ''}`}
                  value={form.date} min={today} onChange={e => set('date', e.target.value)} />
              </F>
              <div className="form-group">
                <label className="form-label">Audience Size <span className="required">*</span></label>
                <input type="number" className={`form-control ${errors.audience_size ? 'error' : ''}`}
                  value={form.audience_size} min={1} onChange={e => set('audience_size', e.target.value)} placeholder="200" />
                {errors.audience_size && <div className="form-error">{errors.audience_size}</div>}
              </div>
            </div>

            <div className="form-row">
              <F name="start_time" label="Start Time (min 09:00)">
                <input type="time" className={`form-control ${errors.start_time ? 'error' : ''}`}
                  value={form.start_time} min="09:00" max="17:00" onChange={e => set('start_time', e.target.value)} />
              </F>
              <F name="end_time" label="End Time (max 17:00)">
                <input type="time" className={`form-control ${errors.end_time ? 'error' : ''}`}
                  value={form.end_time} min="09:00" max="17:00" onChange={e => set('end_time', e.target.value)} />
              </F>
            </div>

            <F name="purpose" label="Purpose">
              <textarea className={`form-control ${errors.purpose ? 'error' : ''}`} rows={3}
                value={form.purpose} onChange={e => set('purpose', e.target.value)}
                placeholder="Describe the purpose of this event..." />
            </F>

            <div className="form-group">
              <label className="form-label">Equipment Required</label>
              <div className="checkbox-group">
                {EQUIPMENT.map(eq => (
                  <label key={eq} className="checkbox-item">
                    <input type="checkbox" checked={form.equipment.includes(eq)} onChange={() => toggleArr('equipment', eq)} />
                    {eq}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Media Services</label>
              <div className="checkbox-group">
                {MEDIA.map(m => (
                  <label key={m} className="checkbox-item">
                    <input type="checkbox" checked={form.media.includes(m)} onChange={() => toggleArr('media', m)} />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner-inline" /> Submitting...</> : '📤 Submit Booking'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/bookings/my')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
