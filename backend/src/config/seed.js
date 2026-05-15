require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('./mongo');

async function seed() {
  const db = await getDb();

  const users = [
    { name: 'Admin',     email: 'admin@college.edu',     password: 'admin123',     role: 'Admin',     department: null },
    { name: 'Principal', email: 'principal@college.edu', password: 'principal123', role: 'Principal', department: null },
    { name: 'HOD CS',    email: 'hod@college.edu',       password: 'hod123',       role: 'HOD',       department: 'Computer Science' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await db.collection('users').updateOne(
      { email: u.email },
      {
        $setOnInsert: {
          name: u.name,
          email: u.email,
          password: hash,
          role: u.role,
          department: u.department,
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log('✅ Mongo seed complete.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

