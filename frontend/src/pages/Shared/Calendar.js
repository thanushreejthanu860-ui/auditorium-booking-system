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
    <div>
      <div className="page-header">
        <div><h2>📅 Auditorium Calendar</h2><p>Approved bookings with buffer zones</p></div>
      </div>

      <div className="calendar-wrap">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={prevMonth}>‹ Prev</button>
            <strong style={{ fontSize: 16 }}>{current.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
            <button onClick={nextMonth}>Next ›</button>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <span><span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>■</span> Event</span>
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
                          <div>{ev.event_name}</div>
                          <div style={{ fontSize: 10, opacity: 0.85 }}>{ev.start_time} – {ev.end_time}</div>
                          {ev.department && <div style={{ fontSize: 10, opacity: 0.85 }}>{ev.department}</div>}
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
          style={{ top: Math.min(popup.y, window.innerHeight - 220), left: Math.min(popup.x, window.innerWidth - 320) }}
        >
          <button className="event-popup-close" onClick={() => setPopup(null)}>✕</button>
          <h4>{popup.ev.event_name}</h4>
          <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
            <div>📅 {popup.ev.date}</div>
            <div>🕐 {popup.ev.start_time} – {popup.ev.end_time}</div>
            {popup.ev.department && <div>🏢 {popup.ev.department}</div>}
            <div style={{ marginTop: 8, color: 'var(--warning)', fontSize: 12 }}>
              Buffer: {popup.ev.buffer_start} – {popup.ev.start_time} &amp; {popup.ev.end_time} – {popup.ev.buffer_end}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
