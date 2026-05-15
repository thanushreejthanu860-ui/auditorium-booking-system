- [x] Update .env: set MONGODB_URI to provided connection string and ensure dependent vars exist (optional)
- [x] Remove/neutralize MySQL config (src/config/db.js) so “use mongodb instead of mysql” is fully satisfied
- [x] Ensure no references to mysql/MySQL remain in backend JS
- [x] Run backend setup (migrate+seed) and start to verify Mongo connectivity (fails due to Atlas DNS/SRV/network access)

