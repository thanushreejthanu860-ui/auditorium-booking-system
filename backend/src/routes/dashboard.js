const router = require('express').Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  const isHOD = req.user.role === 'HOD';
  const condition = isHOD ? 'WHERE hod_id = ?' : '';
  const params    = isHOD ? [req.user.userId] : [];

  const [rows] = await pool.query(
    `SELECT
       COUNT(*)                            AS total,
       SUM(status = 'approved')            AS approved,
       SUM(status = 'pending_admin')       AS pending_admin,
       SUM(status = 'pending_principal')   AS pending_principal,
       SUM(status = 'rejected')            AS rejected
     FROM bookings ${condition}`,
    params
  );

  const s = rows[0];
  res.json({
    total:             Number(s.total),
    approved:          Number(s.approved),
    pending_admin:     Number(s.pending_admin),
    pending_principal: Number(s.pending_principal),
    rejected:          Number(s.rejected),
  });
});

module.exports = router;
