import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { getAuth, clearAuth } from '../utils/auth';
import api from '../utils/api';

const NAV = {
  HOD: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/bookings/new', icon: '➕', label: 'New Booking' },
    { to: '/bookings/my', icon: '📋', label: 'My Bookings' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
  ],
  Admin: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/review', icon: '🔍', label: 'Review Requests' },
    { to: '/admin/users', icon: '👥', label: 'Manage Users' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
  ],
  Principal: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/principal/approvals', icon: '✅', label: 'Final Approvals' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
  ],
};

export default function Layout() {
  const { role, name } = getAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    api.get('/api/notifications/my').then(r => setNotifications(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    await api.patch(`/api/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const logout = () => { clearAuth(); navigate('/login'); };

  const navItems = NAV[role] || [];

  return (
    <div className="layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>🏛️ Ratan Tata Auditorium</h2>
          <span>Booking System</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{name}</strong>
            {role}
          </div>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="menu-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className="header-title">Auditorium Booking System</span>
        </div>
        <div className="header-right" ref={notifRef}>
          <button className="notif-btn" onClick={() => setShowNotif(o => !o)}>
            🔔
            {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <h4>Notifications</h4>
              {notifications.length === 0
                ? <div className="notif-empty">No notifications</div>
                : notifications.slice(0, 20).map(n => (
                  <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
                    {n.message}
                    <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="page"><Outlet /></div>
      </main>
    </div>
  );
}
