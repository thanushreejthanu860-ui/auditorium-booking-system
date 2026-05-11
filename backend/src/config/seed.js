require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const users = [
    { name: 'Admin',     email: 'admin@college.edu',     password: 'admin123',     role: 'Admin',     department: null },
    { name: 'Principal', email: 'principal@college.edu', password: 'principal123', role: 'Principal', department: null },
    { name: 'HOD CS',    email: 'hod@college.edu',       password: 'hod123',       role: 'HOD',       department: 'Computer Science' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT IGNORE INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)`,
      [u.name, u.email, hash, u.role, u.department]
    );
  }

  console.log('✅ Seed complete.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
