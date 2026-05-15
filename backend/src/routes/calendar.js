const router = require('express').Router();
const { getDb } = require('../config/mongo');
const { auth } = require('../middleware/auth');

function toMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function toTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// GET /api/calendar
router.get('/', auth, async (req, res) => {
  const db = await getDb();
  const rows = await db
    .collection('bookings')
    .find({ status: 'approved' }, { projection: { event_name: 1, date: 1, start_time: 1, end_time: 1 } })
    .sort({ date: 1, start_time: 1 })
    .toArray();

  res.json(
    rows.map(b => ({
      id: b._id.toString(),
      event_name: b.event_name,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      buffer_start: toTime(toMins(b.start_time) - 30),
      buffer_end: toTime(toMins(b.end_time) + 30),
    }))
  );
});

module.exports = router;

