import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function ReviewRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/bookings?status=pending_admin').then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const forward = async (id) => {
    setActing(id + '_fwd');
    try {
      await api.patch(`/api/bookings/${id}/forward`);
      toast.success('Forwarded to Principal!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActing(null);
    }
  };

  const reject = async (id, name) => {
    if (!window.confirm(`Reject booking "${name}"? This cannot be undone.`)) return;
    setActing(id + '_rej');
    try {
      await api.patch(`/api/bookings/${id}/reject`);
      toast.success('Booking rejected.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActing(null);
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="page-header">
        <div><h2>🔍 Review Requests</h2><p>{bookings.length} pending request{bookings.length !== 1 ? 's' : ''}</p></div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No pending requests. All caught up!</p>
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="booking-card">
            <div className="booking-card-header">
              <div className="booking-card-title">{b.event_name}</div>
              <span className="badge badge-pending-admin">Pending Admin</span>
            </div>
            <div className="booking-card-meta">
              <span>📅 {b.date}</span>
              <span>🕐 {b.start_time} – {b.end_time}</span>
              {b.audience_size && <span>👥 {b.audience_size} attendees</span>}
              <span>🕒 {new Date(b.created_at).toLocaleDateString()}</span>
            </div>
            {b.purpose && (
              <div className="booking-detail-row">
                <span className="detail-label">Purpose:</span>
                <span>{b.purpose}</span>
              </div>
            )}
            {(() => { const eq = Array.isArray(b.equipment) ? b.equipment : JSON.parse(b.equipment || '[]'); return eq.length > 0 && <div className="booking-detail-row"><span className="detail-label">Equipment:</span><span>{eq.join(', ')}</span></div>; })()}
            {(() => { const md = Array.isArray(b.media) ? b.media : JSON.parse(b.media || '[]'); return md.length > 0 && <div className="booking-detail-row"><span className="detail-label">Media:</span><span>{md.join(', ')}</span></div>; })()}
            <div className="booking-card-actions">
              <button
                className="btn btn-success btn-sm"
                onClick={() => forward(b.id)}
                disabled={acting === b.id + '_fwd'}
              >
                {acting === b.id + '_fwd' ? <span className="spinner-inline" /> : '✅'} Verify &amp; Forward to Principal
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => reject(b.id, b.event_name)}
                disabled={acting === b.id + '_rej'}
              >
                {acting === b.id + '_rej' ? <span className="spinner-inline" /> : '✕'} Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
