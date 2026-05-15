const router = require('express').Router();
const { getDb } = require('../config/mongo');
const { auth } = require('../middleware/auth');

// GET /api/notifications/my
router.get('/my', auth, async (req, res) => {
  const db = await getDb();
  const rows = await db
    .collection('notifications')
    .find({ user_id: req.user.userId })
    .sort({ created_at: -1 })
    .toArray();

  res.json(
    rows.map(n => ({
      id: n._id.toString(),
      user_id: n.user_id,
      message: n.message,
      is_read: n.is_read,
      created_at: n.created_at,
    }))
  );
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  const db = await getDb();

  const notification = await db.collection('notifications').findOne({
    _id: new (require('mongodb').ObjectId)(req.params.id),
    user_id: req.user.userId,
  });

  if (!notification) return res.status(404).json({ message: 'Notification not found.' });

  await db.collection('notifications').updateOne(
    { _id: notification._id },
    { $set: { is_read: true } }
  );

  res.json({ message: 'Marked as read.' });
});

module.exports = router;

