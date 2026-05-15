require('dotenv').config();

// This project migrated from MySQL to MongoDB.
// This file is kept only for backward compatibility so older imports
// like `require('./config/db')` don't crash.
// It does NOT provide a MySQL connection anymore.

const { getDb } = require('./mongo');

// Provide an async getter that returns the Mongo db connection.
module.exports = {
  getDb,
};


