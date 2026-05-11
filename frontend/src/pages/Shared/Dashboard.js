import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getAuth } from '../../utils/auth';
import Spinner from '../../components/Spinner';

const STAT_CONFIG = [
  { key: 'total', label: 'Total', cls: 'total' },
  { key: 'approved', label: 'Approved', cls: 'approved' },
  { key: 'pending_admin', label: 'Pending Admin', cls: 'pending-admin' },
  { key: 'pending_principal', label: 'Pending Principal', cls: 'pending-principal' },
  { key: 'rejected', label: 'Rejected', cls: 'rejected' },
];

const QUICK_ACTIONS = {
  HOD: [
    { label: '➕ New Booking', to: '/bookings/new', cls: 'btn-primary' },
    { label: '📋 My Bookings', to: '/bookings/my', cls: 'btn-outline' },
    { label: '📅 Calendar', to: '/calendar', cls: 'btn-outline' },
  ],
  Admin: [
    { label: '🔍 Review Requests', to: '/admin/review', cls: 'btn-primary' },
    { label: '👥 Manage Users', to: '/admin/users', cls: 'btn-outline' },
    { label: '📅 Calendar', to: '/calendar', cls: 'btn-outline' },
  ],
  Principal: [
    { label: '✅ Final Approvals', to: '/principal/approvals', cls: 'btn-primary' },
    { label: '📅 Calendar', to: '/calendar', cls: 'btn-outline' },
  ],
};

export default function Dashboard() {
  const { role, name } = getAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/stats'),
      api.get('/api/notifications/my'),
    ]).then(([s, n]) => {
      setStats(s.data);
      setNotifications(n.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {name} 👋</h2>
          <p>Here's what's happening with the auditorium.</p>
        </div>
      </div>

      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, cls }) => (
          <div key={key} className={`stat-card ${cls}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{stats?.[key] ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="card-body">
            <div className="quick-actions">
              {(QUICK_ACTIONS[role] || []).map(a => (
                <button key={a.to} className={`btn ${a.cls}`} onClick={() => navigate(a.to)}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Notifications</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {notifications.length === 0
              ? <div className="notif-empty">No recent notifications</div>
              : notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                  {n.message}
                  <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
