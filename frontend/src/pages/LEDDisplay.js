import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function LEDDisplay() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = () => {
    api.get('/api/display/today').then(r => {
      if (Array.isArray(r.data)) {
        setEvents(r.data);
        setMessage('');
      } else {
        setEvents([]);
        setMessage(r.data.message || 'No events today.');
      }
      setLastRefresh(new Date());
    }).catch(() => {
      setMessage('Unable to load events.');
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="led-page">
      {events.length === 0 ? (
        <div className="led-no-event">
          <div style={{ fontSize: 80, marginBottom: 24 }}>🏛️</div>
          <div>Ratan Tata Auditorium</div>
          <div style={{ fontSize: 'clamp(14px, 2vw, 20px)', color: '#475569', marginTop: 12 }}>
            {message || 'No events scheduled for today.'}
          </div>
        </div>
      ) : (
        <div className="led-event-list">
          <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#64748b', marginBottom: 32, textTransform: 'uppercase', letterSpacing: 4 }}>
            Today's Events
          </div>
          {events.map((ev, i) => (
            <div key={i} className="led-event-item">
              <div className="led-title">{ev.event_name}</div>
              <div className="led-time">🕐 {ev.start_time} – {ev.end_time}</div>
              <div className="led-dept">🏢 {ev.department || 'College Event'}</div>
              {ev.file_url && (
                ev.file_url.endsWith('.pdf')
                  ? <div style={{ color: '#94a3b8', fontSize: 16 }}>📄 PDF Content Available</div>
                  : <img className="led-image" src={ev.file_url} alt={ev.event_name} />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="led-refresh">
        Auto-refreshes every 60s · Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}
