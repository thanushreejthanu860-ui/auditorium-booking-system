const router = require('express').Router();
const pool = require('../config/db');

// GET /api/display/today — Public
router.get('/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const [rows] = await pool.query(
    `SELECT b.event_name, b.start_time, b.end_time, u.department, up.file_path
     FROM bookings b
     JOIN users u ON u.id = b.hod_id
     LEFT JOIN uploads up ON up.booking_id = b.id
     WHERE b.status = 'approved' AND b.date = ?
     ORDER BY b.start_time ASC`,
    [today]
  );

  if (!rows.length) return res.json({ message: 'No events today.' });

  res.json(rows.map(r => ({
    event_name: r.event_name,
    start_time: r.start_time,
    end_time:   r.end_time,
    department: r.department,
    file_url:   r.file_path ? `${process.env.BASE_URL}/${r.file_path}` : null,
  })));
});

module.exports = router;
