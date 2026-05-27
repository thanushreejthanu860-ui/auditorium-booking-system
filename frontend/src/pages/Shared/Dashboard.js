import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getAuth } from '../../utils/auth';
import Spinner from '../../components/Spinner';

const STAT_CONFIG = [
  { key: 'total', label: 'Total', color: '#6b7280' },
  { key: 'approved', label: 'Approved', color: '#16a34a' },
  { key: 'pending_admin', label: 'Pending Admin', color: '#ea580c' },
  { key: 'pending_principal', label: 'Pending Principal', color: '#0284c7' },
  { key: 'rejected', label: 'Rejected', color: '#dc2626' },
];

const QUICK_ACTIONS = {
  HOD: [
    { label: '+ New Booking', to: '/bookings/new', cls: 'btn-primary' },
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
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {name} 👋</h1>
        <p className="dashboard-date">Here's what's happening with the auditorium.</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, color }) => (
          <div 
            key={key} 
            className="stat-card"
            style={{ 
              borderLeft: `4px solid ${color}`,
              borderTop: 'none'
            }}
          >
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color: color }}>
              {stats?.[key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-content">
        <div className="dashboard-panel">
          {/* Quick Actions */}
          <div className="panel-header">
            <h3 className="panel-title">Quick Actions</h3>
          </div>
          <div className="panel-body">
            <div className="quick-actions">
              {(QUICK_ACTIONS[role] || []).map((a, idx) => (
                <button 
                  key={idx}
                  onClick={() => navigate(a.to)}
                  className={`btn quick-action-btn ${a.cls}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          {/* Recent Notifications */}
          <div className="panel-header">
            <h3 className="panel-title">Recent Notifications</h3>
          </div>
          <div className="panel-body">
            <div className="notifications-list">
              {notifications.length === 0
                ? <div className="empty-notifications">No recent notifications</div>
                : notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                  >
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">
                      {new Date(n.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
