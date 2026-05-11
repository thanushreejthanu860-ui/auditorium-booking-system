const router = require('express').Router();
const pool = require('../config/db');
const { auth, role } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// POST /api/bookings/:id/upload
router.post('/:id/upload', auth, role('HOD'), uploadMiddleware, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  const booking = rows[0];
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.hod_id !== req.user.userId) return res.status(403).json({ message: 'Not your booking.' });
  if (booking.status !== 'approved') return res.status(400).json({ message: 'Uploads only allowed for approved bookings.' });

  const { originalname, mimetype, filename } = req.file;
  await pool.query(
    'INSERT INTO uploads (booking_id, file_name, file_type, file_path) VALUES (?, ?, ?, ?)',
    [req.params.id, originalname, mimetype, `uploads/${filename}`]
  );

  res.status(201).json({ file_url: `${process.env.BASE_URL}/uploads/${filename}` });
});

module.exports = router;
