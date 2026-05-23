import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
  pending_admin: 'badge-pending-admin',
  pending_principal: 'badge-pending-principal',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
};

const STATUS_LABEL = {
  pending_admin: 'Pending Admin',
  pending_principal: 'Pending Principal',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="page-header">
        <div><h2>📋 My Bookings</h2><p>All your booking requests</p></div>
        <button className="btn btn-primary" onClick={() => navigate('/bookings/new')}>➕ New Booking</button>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No bookings yet. Create your first booking!</p>
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="booking-card">
            <div className="booking-card-header">
              <div className="booking-card-title">{b.event_name}</div>
              <span className={`badge ${STATUS_BADGE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
            </div>
            <div className="booking-card-meta">
              <span>📅 {b.date}</span>
              <span>🕐 {b.start_time} – {b.end_time}</span>
              {b.audience_size && <span>👥 {b.audience_size} attendees</span>}
              <span>🕒 Submitted {new Date(b.created_at).toLocaleDateString()}</span>
            </div>
            {b.purpose && <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{b.purpose}</div>}
            {(b.equipment || b.media) && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-500)' }}>
                {(() => { const eq = Array.isArray(b.equipment) ? b.equipment : JSON.parse(b.equipment || '[]'); return eq.length > 0 && <span>🔧 {eq.join(', ')} </span>; })()}
                {(() => { const md = Array.isArray(b.media) ? b.media : JSON.parse(b.media || '[]'); return md.length > 0 && <span>🎥 {md.join(', ')}</span>; })()}
              </div>
            )}
            {b.status === 'approved' && (
              <div className="booking-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/bookings/${b.id}/upload`)}>
                  📤 Upload LED Content
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
