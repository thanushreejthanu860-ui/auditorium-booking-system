import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function FinalApproval() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/bookings?status=pending_principal').then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id) => {
    setActing(id + '_app');
    try {
      await api.patch(`/api/bookings/${id}/approve`);
      toast.success('Booking approved!');
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
        <div><h2>✅ Final Approvals</h2><p>{bookings.length} awaiting your decision</p></div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <p>No pending approvals. All done!</p>
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="booking-card">
            <div className="booking-card-header">
              <div>
                <div className="booking-card-title">{b.event_name}</div>
                <span className="verified-label" style={{ marginTop: 4 }}>✓ Verified by Admin</span>
              </div>
              <span className="badge badge-pending-principal">Pending Principal</span>
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
                onClick={() => approve(b.id)}
                disabled={acting === b.id + '_app'}
              >
                {acting === b.id + '_app' ? <span className="spinner-inline" /> : '✅'} Approve
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
