import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(new Date());
  const [popup, setPopup] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    api.get('/api/calendar').then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => { if (popupRef.current && !popupRef.current.contains(e.target)) setPopup(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const eventsForDay = (d) => {
    const ds = dateStr(d);
    return events.filter(e => e.date === ds || e.date?.startsWith(ds));
  };

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  if (loading) return <Spinner full />;

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h2>📅 Auditorium Calendar</h2>
          <p>Approved bookings with buffer zones</p>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={prevMonth} className="nav-btn">‹ Prev</button>
            <strong className="month-year">{current.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
            <button onClick={nextMonth} className="nav-btn">Next ›</button>
          </div>
          <div className="calendar-legend">
            <span><span className="legend-color primary"></span> Event</span>
          </div>
        </div>

        <div className="calendar-grid">
          {DAYS.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
          {cells.map((day, i) => {
            const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const dayEvents = day ? eventsForDay(day) : [];
            return (
              <div key={i} className="calendar-cell">
                {day && (
                  <>
                    <div className={`calendar-date ${isToday ? 'today' : ''}`}>{day}</div>
                    {dayEvents.map(ev => (
                      <div key={ev.id}>
                        <div
                          className="event-block event-main"
                          title={ev.event_name}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setPopup({ ev, x: rect.left, y: rect.bottom + 4 });
                          }}
                        >
                          {ev.department && <div className="event-department">{ev.department}</div>}
                          <div className="event-name">{ev.event_name}</div>
                          <div className="event-time">{ev.start_time} – {ev.end_time}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {popup && (
        <div
          ref={popupRef}
          className="event-popup"
          style={{ top: Math.min(popup.y, window.innerHeight - 240), left: Math.min(popup.x, window.innerWidth - 340) }}
        >
          <button className="popup-close" onClick={() => setPopup(null)}>✕</button>
          <h4 className="popup-title">{popup.ev.event_name}</h4>
          <div className="popup-content">
            <div className="popup-row">
              <span className="popup-label">📅 Date:</span>
              <span className="popup-value">{popup.ev.date}</span>
            </div>
            <div className="popup-row">
              <span className="popup-label">🕐 Time:</span>
              <span className="popup-value">{popup.ev.start_time} – {popup.ev.end_time}</span>
            </div>
            {popup.ev.department && (
              <div className="popup-row">
                <span className="popup-label">🏢 Department:</span>
                <span className="popup-value">{popup.ev.department}</span>
              </div>
            )}
            <div className="popup-row">
              <span className="popup-label">⚠️ Buffer:</span>
              <span className="popup-value">
                {popup.ev.buffer_start} – {popup.ev.start_time} &amp; {popup.ev.end_time} – {popup.ev.buffer_end}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
