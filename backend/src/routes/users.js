const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/mongo');
const { auth, role } = require('../middleware/auth');

// GET /api/users
router.get('/', auth, role('Admin'), async (req, res) => {
  const db = await getDb();
  const users = await db
    .collection('users')
    .find({}, { projection: { name: 1, email: 1, role: 1, department: 1, created_at: 1 } })
    .sort({ created_at: -1 })
    .toArray();

  res.json(
    users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department ?? null,
      created_at: u.created_at,
    }))
  );
});

// POST /api/users
router.post('/', auth, role('Admin'), async (req, res) => {
  const { name, email, role: userRole, department } = req.body;
  if (!name || !email || !userRole)
    return res.status(400).json({ message: 'name, email, and role are required.' });

  const db = await getDb();
  const existing = await db.collection('users').findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists.' });

  const hash = await bcrypt.hash('pass123', 10);

  const result = await db.collection('users').insertOne({
    name,
    email,
    password: hash,
    role: userRole,
    department: department || null,
    created_at: new Date(),
  });

  res.status(201).json({
    id: result.insertedId.toString(),
    name,
    email,
    role: userRole,
    department: department || null,
  });
});

module.exports = router;

