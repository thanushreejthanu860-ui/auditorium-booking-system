const router = require('express').Router();
const pool = require('../config/db');
const { auth, role } = require('../middleware/auth');
const sendMail = require('../config/mailer');

function toMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(s1, e1, s2, e2) {
  return s1 < e2 && e1 > s2;
}

async function notify(userId, message) {
  await pool.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);
}

// POST /api/bookings
router.post('/', auth, role('HOD'), async (req, res) => {
  const { event_name, date, start_time, end_time, purpose, audience_size, equipment, media } = req.body;
  if (!event_name || !date || !start_time || !end_time)
    return res.status(400).json({ message: 'event_name, date, start_time, end_time are required.' });

  const newStart = toMins(start_time);
  const newEnd   = toMins(end_time);

  if (newStart < toMins('09:00') || newEnd > toMins('17:00'))
    return res.status(400).json({ message: 'Bookings must be between 09:00 and 17:00.' });

  if (newStart >= newEnd)
    return res.status(400).json({ message: 'start_time must be before end_time.' });

  const [approved] = await pool.query(
    `SELECT start_time, end_time FROM bookings WHERE status = 'approved' AND date = ?`, [date]
  );

  for (const b of approved) {
    const bufStart = toMins(b.start_time) - 30;
    const bufEnd   = toMins(b.end_time)   + 30;
    if (overlaps(newStart, newEnd, bufStart, bufEnd))
      return res.status(409).json({ message: 'Time slot conflict.' });
  }

  const [result] = await pool.query(
    `INSERT INTO bookings (hod_id, event_name, date, start_time, end_time, purpose, audience_size, equipment, media, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_admin')`,
    [req.user.userId, event_name, date, start_time, end_time,
     purpose || null, audience_size || null,
     JSON.stringify(equipment || []), JSON.stringify(media || [])]
  );

  const [admins] = await pool.query(`SELECT id, email FROM users WHERE role = 'Admin'`);
  for (const admin of admins) {
    await notify(admin.id, `New booking "${event_name}" on ${date} by ${req.user.name}.`);
    sendMail(admin.email, 'New Booking Request', `${req.user.name} submitted a booking for "${event_name}" on ${date}.`);
  }

  res.status(201).json({ id: result.insertId, status: 'pending_admin' });
});

// GET /api/bookings
router.get('/', auth, async (req, res) => {
  let query = 'SELECT * FROM bookings';
  const params = [];
  const conditions = [];

  if (req.user.role === 'HOD') { conditions.push('hod_id = ?'); params.push(req.user.userId); }
  if (req.query.status)        { conditions.push('status = ?'); params.push(req.query.status); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

// GET /api/bookings/my
router.get('/my', auth, role('HOD'), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM bookings WHERE hod_id = ? ORDER BY created_at DESC', [req.user.userId]
  );
  res.json(rows);
});

// PATCH /api/bookings/:id/forward
router.patch('/:id/forward', auth, role('Admin'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  const booking = rows[0];
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'pending_admin')
    return res.status(400).json({ message: 'Booking is not pending_admin.' });

  await pool.query(`UPDATE bookings SET status = 'pending_principal' WHERE id = ?`, [req.params.id]);

  const [principals] = await pool.query(`SELECT id, email FROM users WHERE role = 'Principal'`);
  for (const p of principals) {
    await notify(p.id, `Booking "${booking.event_name}" on ${booking.date} awaits your approval.`);
    sendMail(p.email, 'Booking Awaiting Approval', `Booking "${booking.event_name}" on ${booking.date} forwarded for your approval.`);
  }
  await notify(booking.hod_id, `Your booking "${booking.event_name}" on ${booking.date} was forwarded to the Principal.`);

  res.json({ message: 'Forwarded to Principal.' });
});

// PATCH /api/bookings/:id/approve
router.patch('/:id/approve', auth, role('Principal'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  const booking = rows[0];
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'pending_principal')
    return res.status(400).json({ message: 'Booking is not pending_principal.' });

  await pool.query(`UPDATE bookings SET status = 'approved' WHERE id = ?`, [req.params.id]);

  const [hodRows] = await pool.query('SELECT email FROM users WHERE id = ?', [booking.hod_id]);
  await notify(booking.hod_id, `Your booking "${booking.event_name}" on ${booking.date} has been approved!`);
  sendMail(hodRows[0].email, 'Booking Approved', `Your booking "${booking.event_name}" on ${booking.date} has been approved.`);

  // Auto-reject conflicting pending bookings on same date
  const bufStart = toMins(booking.start_time) - 30;
  const bufEnd   = toMins(booking.end_time)   + 30;

  const [pending] = await pool.query(
    `SELECT * FROM bookings WHERE date = ? AND status IN ('pending_admin','pending_principal') AND id != ?`,
    [booking.date, booking.id]
  );

  for (const p of pending) {
    if (overlaps(toMins(p.start_time), toMins(p.end_time), bufStart, bufEnd)) {
      await pool.query(`UPDATE bookings SET status = 'rejected' WHERE id = ?`, [p.id]);
      const [pHod] = await pool.query('SELECT email FROM users WHERE id = ?', [p.hod_id]);
      await notify(p.hod_id, `Your booking "${p.event_name}" on ${p.date} was auto-rejected due to a conflict.`);
      sendMail(pHod[0].email, 'Booking Auto-Rejected', `Your booking "${p.event_name}" on ${p.date} was auto-rejected due to a time conflict.`);
    }
  }

  res.json({ message: 'Booking approved.' });
});

// PATCH /api/bookings/:id/reject
router.patch('/:id/reject', auth, role('Admin', 'Principal'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  const booking = rows[0];
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (['approved', 'rejected'].includes(booking.status))
    return res.status(400).json({ message: `Cannot reject a booking that is already ${booking.status}.` });

  await pool.query(`UPDATE bookings SET status = 'rejected' WHERE id = ?`, [req.params.id]);

  const [hodRows] = await pool.query('SELECT email FROM users WHERE id = ?', [booking.hod_id]);
  await notify(booking.hod_id, `Your booking "${booking.event_name}" on ${booking.date} has been rejected.`);
  sendMail(hodRows[0].email, 'Booking Rejected', `Your booking "${booking.event_name}" on ${booking.date} has been rejected.`);

  res.json({ message: 'Booking rejected.' });
});

module.exports = router;
