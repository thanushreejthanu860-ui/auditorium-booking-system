const router = require('express').Router();
const { getDb } = require('../config/mongo');
const { auth, role } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// POST /api/bookings/:id/upload
router.post('/:id/upload', auth, role('HOD'), uploadMiddleware, async (req, res) => {
  const db = await getDb();
  const bookingId = req.params.id;

  const booking = await db.collection('bookings').findOne({ _id: new (require('mongodb').ObjectId)(bookingId) });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.hod_id !== req.user.userId) return res.status(403).json({ message: 'Not your booking.' });
  if (booking.status !== 'approved') return res.status(400).json({ message: 'Uploads only allowed for approved bookings.' });

  const { originalname, mimetype, filename } = req.file;

  const fileDoc = {
    booking_id: booking._id.toString(),
    file_name: originalname,
    file_type: mimetype,
    file_path: `uploads/${filename}`,
    uploaded_at: new Date(),
  };

  await db.collection('uploads').insertOne(fileDoc);

  res.status(201).json({ file_url: `${process.env.BASE_URL}/uploads/${filename}` });
});

module.exports = router;

