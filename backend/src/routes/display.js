const router = require('express').Router();
const { getDb } = require('../config/mongo');

// GET /api/display/today — Public
router.get('/today', async (req, res) => {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];

  const rows = await db.collection('bookings').find({
    status: 'approved',
    date: today,
  }).sort({ start_time: 1 }).toArray();

  if (!rows.length) return res.json({ message: 'No events today.' });

  const hodIds = [...new Set(rows.map(r => r.hod_id))];

  const hodUsers = await db.collection('users')
    .find({ _id: { $in: hodIds.map(id => new (require('mongodb').ObjectId)(id)) } })
    .project({ department: 1 })
    .toArray();

  const hodById = new Map(hodUsers.map(u => [u._id.toString(), u]));

  const bookingIds = rows.map(r => r._id.toString());

  const uploads = await db.collection('uploads')
    .find({ booking_id: { $in: bookingIds } })
    .toArray();

  const uploadByBooking = new Map();
  for (const up of uploads) {
    const bid = up.booking_id;
    if (!uploadByBooking.has(bid)) uploadByBooking.set(bid, up);
  }

  res.json(rows.map(r => {
    const hod = hodById.get(r.hod_id);
    const up = uploadByBooking.get(r._id.toString());

    return {
      event_name: r.event_name,
      start_time: r.start_time,
      end_time: r.end_time,
      department: hod?.department ?? null,
      file_url: up?.file_path ? `${process.env.BASE_URL}/${up.file_path}` : null,
    };
  }));
});

module.exports = router;

