require('dotenv').config();
const { getDb } = require('./mongo');

async function migrate() {
  // Mongo does not require schema migrations; we ensure indexes/collections exist.
  await getDb();
  console.log('✅ Mongo migration (indexes) complete.');
}

migrate().catch(err => { console.error(err); process.exit(1); });

