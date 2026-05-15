require('dotenv').config();
const { MongoClient } = require('mongodb');

let client;
let db;

async function connectMongo() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI in environment');

  // Support either mongodb+srv://... or full connection strings.
  // Also tolerate accidental whitespace/newlines from .env files.
  const normalizedUri = uri.trim();

  client = new MongoClient(normalizedUri);
  await client.connect();
  db = client.db(process.env.MONGODB_DB_NAME || 'auditorium_booking');

  // Helpful defaults: ensure indexes exist.
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('bookings').createIndex({ date: 1, status: 1 }),
    db.collection('uploads').createIndex({ booking_id: 1 }),
    db.collection('notifications').createIndex({ user_id: 1, created_at: -1 }),
  ]);

  return db;
}

async function getDb() {
  return connectMongo();
}

async function closeMongo() {
  if (client) await client.close();
}

module.exports = { getDb, closeMongo };

