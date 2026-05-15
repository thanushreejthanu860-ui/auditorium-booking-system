const router = require('express').Router();
const { getDb } = require('../config/mongo');
const { auth, role } = require('../middleware/auth');
const sendMail = require('../config/mailer');

function toMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(s1, e1, s2, e2) {
  return s1 < e2 && e1 > s2;
}

async function notify(db, userId, message) {
  await db.collection('notifications').insertOne({
    user_id: userId,
    message,
    is_read: false,
    created_at: new Date(),
  });
}

// POST /api/bookings
router.post('/', auth, role('HOD'), async (req, res) => {
  const db = await getDb();

  const { event_name, date, start_time, end_time, purpose, audience_size, equipment, media } = req.body;
  if (!event_name || !date || !start_time || !end_time)
    return res.status(400).json({ message: 'event_name, date, start_time, end_time are required.' });

  const newStart = toMins(start_time);
  const newEnd = toMins(end_time);

  if (newStart < toMins('09:00') || newEnd > toMins('17:00'))
    return res.status(400).json({ message: 'Bookings must be between 09:00 and 17:00.' });

  if (newStart >= newEnd)
    return res.status(400).json({ message: 'start_time must be before end_time.' });

  const approved = await db.collection('bookings').find({
    status: 'approved',
    date,
  }, { projection: { start_time: 1, end_time: 1 } }).toArray();

  for (const b of approved) {
    const bufStart = toMins(b.start_time) - 30;
    const bufEnd = toMins(b.end_time) + 30;
    if (overlaps(newStart, newEnd, bufStart, bufEnd))
      return res.status(409).json({ message: 'Time slot conflict.' });
  }

  const result = await db.collection('bookings').insertOne({
    hod_id: req.user.userId,
    event_name,
    date,
    start_time,
    end_time,
    purpose: purpose || null,
    audience_size: audience_size || null,
    equipment: equipment || [],
    media: media || [],
    status: 'pending_admin',
    created_at: new Date(),
    updated_at: new Date(),
  });

  const admins = await db.collection('users').find({ role: 'Admin' }, { projection: { email: 1 } }).toArray();

  for (const admin of admins) {
    await notify(db, admin._id.toString(), `New booking \"${event_name}\" on ${date} by ${req.user.name}.`);
    sendMail(admin.email, 'New Booking Request', `${req.user.name} submitted a booking for \"${event_name}\" on ${date}.`);
  }

  res.status(201).json({ id: result.insertedId.toString(), status: 'pending_admin' });
});

// GET /api/bookings
router.get('/', auth, async (req, res) => {
  const db = await getDb();

  const filter = {};
  if (req.user.role === 'HOD') filter.hod_id = req.user.userId;
  if (req.query.status) filter.status = req.query.status;

  const rows = await db.collection('bookings').find(filter).sort({ created_at: -1 }).toArray();
  res.json(rows.map(b => ({
    id: b._id.toString(),
    ...b,
  })));
});

// GET /api/bookings/my
router.get('/my', auth, role('HOD'), async (req, res) => {
  const db = await getDb();

  const rows = await db.collection('bookings')
    .find({ hod_id: req.user.userId })
    .sort({ created_at: -1 })
    .toArray();

  res.json(rows);
});

// PATCH /api/bookings/:id/forward
router.patch('/:id/forward', auth, role('Admin'), async (req, res) => {
  const db = await getDb();

  const booking = await db.collection('bookings').findOne({ _id: new (require('mongodb').ObjectId)(req.params.id) });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'pending_admin')
    return res.status(400).json({ message: 'Booking is not pending_admin.' });

  await db.collection('bookings').updateOne(
    { _id: booking._id },
    { $set: { status: 'pending_principal', updated_at: new Date() } }
  );

  const principals = await db.collection('users').find({ role: 'Principal' }, { projection: { email: 1 } }).toArray();

  for (const p of principals) {
    await notify(db, p._id.toString(), `Booking \"${booking.event_name}\" on ${booking.date} awaits your approval.`);
    sendMail(p.email, 'Booking Awaiting Approval', `Booking \"${booking.event_name}\" on ${booking.date} forwarded for your approval.`);
  }

  await notify(db, booking.hod_id, `Your booking \"${booking.event_name}\" on ${booking.date} was forwarded to the Principal.`);

  res.json({ message: 'Forwarded to Principal.' });
});

// PATCH /api/bookings/:id/approve
router.patch('/:id/approve', auth, role('Principal'), async (req, res) => {
  const db = await getDb();

  const booking = await db.collection('bookings').findOne({ _id: new (require('mongodb').ObjectId)(req.params.id) });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'pending_principal')
    return res.status(400).json({ message: 'Booking is not pending_principal.' });

  await db.collection('bookings').updateOne(
    { _id: booking._id },
    { $set: { status: 'approved', updated_at: new Date() } }
  );

  const hod = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(booking.hod_id) }, { projection: { email: 1 } });

  await notify(db, booking.hod_id, `Your booking \"${booking.event_name}\" on ${booking.date} has been approved!`);
  if (hod?.email) {
    sendMail(hod.email, 'Booking Approved', `Your booking \"${booking.event_name}\" on ${booking.date} has been approved.`);
  }

  const bufStart = toMins(booking.start_time) - 30;
  const bufEnd = toMins(booking.end_time) + 30;

  const pending = await db.collection('bookings').find({
    date: booking.date,
    status: { $in: ['pending_admin', 'pending_principal'] },
    _id: { $ne: booking._id },
  }, { projection: { start_time: 1, end_time: 1, event_name: 1, date: 1, hod_id: 1, status: 1 } }).toArray();

  for (const p of pending) {
    if (overlaps(toMins(p.start_time), toMins(p.end_time), bufStart, bufEnd)) {
      await db.collection('bookings').updateOne(
        { _id: p._id },
        { $set: { status: 'rejected', updated_at: new Date() } }
      );

      await notify(db, p.hod_id, `Your booking \"${p.event_name}\" on ${p.date} was auto-rejected due to a conflict.`);

      const pHod = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(p.hod_id) }, { projection: { email: 1 } });
      if (pHod?.email) {
        sendMail(pHod.email, 'Booking Auto-Rejected', `Your booking \"${p.event_name}\" on ${p.date} was auto-rejected due to a time conflict.`);
      }
    }
  }

  res.json({ message: 'Booking approved.' });
});

// PATCH /api/bookings/:id/reject
router.patch('/:id/reject', auth, role('Admin', 'Principal'), async (req, res) => {
  const db = await getDb();

  const booking = await db.collection('bookings').findOne({ _id: new (require('mongodb').ObjectId)(req.params.id) });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });

  if (['approved', 'rejected'].includes(booking.status))
    return res.status(400).json({ message: `Cannot reject a booking that is already ${booking.status}.` });

  await db.collection('bookings').updateOne(
    { _id: booking._id },
    { $set: { status: 'rejected', updated_at: new Date() } }
  );

  const hod = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(booking.hod_id) }, { projection: { email: 1 } });

  await notify(db, booking.hod_id, `Your booking \"${booking.event_name}\" on ${booking.date} has been rejected.`);
  if (hod?.email) {
    sendMail(hod.email, 'Booking Rejected', `Your booking \"${booking.event_name}\" on ${booking.date} has been rejected.`);
  }

  res.json({ message: 'Booking rejected.' });
});

module.exports = router;

