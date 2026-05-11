const router = require('express').Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/notifications/my
router.get('/my', auth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId]
  );
  res.json(rows);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId]
  );
  if (!rows.length) return res.status(404).json({ message: 'Notification not found.' });

  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
  res.json({ message: 'Marked as read.' });
});

module.exports = router;
