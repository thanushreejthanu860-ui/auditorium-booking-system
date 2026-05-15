const router = require('express').Router();
const { getDb } = require('../config/mongo');
const { auth } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  const db = await getDb();

  const isHOD = req.user.role === 'HOD';
  const filter = isHOD ? { hod_id: req.user.userId } : {};

  const bookings = await db.collection('bookings').find(filter).project({ status: 1 }).toArray();

  const total = bookings.length;
  const approved = bookings.filter(b => b.status === 'approved').length;
  const pending_admin = bookings.filter(b => b.status === 'pending_admin').length;
  const pending_principal = bookings.filter(b => b.status === 'pending_principal').length;
  const rejected = bookings.filter(b => b.status === 'rejected').length;

  res.json({
    total,
    approved,
    pending_admin,
    pending_principal,
    rejected,
  });
});

module.exports = router;

