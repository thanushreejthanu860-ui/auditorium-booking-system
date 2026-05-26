const router = require('express').Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/calendar
router.get('/', auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.event_name, b.date, b.start_time, b.end_time, u.department
     FROM bookings b JOIN users u ON b.hod_id = u.id
     WHERE b.status = 'approved' ORDER BY b.date, b.start_time`
  );

  res.json(rows.map(b => {
    const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const toTime = m => `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;

    return {
      ...b,
      buffer_start: toTime(toMins(b.start_time) - 30),
      buffer_end:   toTime(toMins(b.end_time)   + 30),
    };
  }));
});

module.exports = router;
