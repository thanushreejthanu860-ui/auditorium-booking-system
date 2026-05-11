const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { auth, role } = require('../middleware/auth');

// GET /api/users
router.get('/', auth, role('Admin'), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, department, created_at FROM users'
  );
  res.json(rows);
});

// POST /api/users
router.post('/', auth, role('Admin'), async (req, res) => {
  const { name, email, role: userRole, department } = req.body;
  if (!name || !email || !userRole)
    return res.status(400).json({ message: 'name, email, and role are required.' });

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(400).json({ message: 'Email already exists.' });

  const hash = await bcrypt.hash('pass123', 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
    [name, email, hash, userRole, department || null]
  );

  res.status(201).json({ id: result.insertId, name, email, role: userRole, department: department || null });
});

module.exports = router;
