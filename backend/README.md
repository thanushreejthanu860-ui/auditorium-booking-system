# Ratan Tata Auditorium Booking & Event Support System — Backend

## Tech Stack
- Node.js + Express.js
- MySQL
- JWT Authentication
- bcryptjs, Multer, Nodemailer, dotenv

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool
│   │   ├── mailer.js      # Nodemailer utility
│   │   ├── migrate.js     # DB schema creation
│   │   └── seed.js        # Default users seed
│   ├── middleware/
│   │   ├── auth.js        # JWT + role middleware
│   │   └── upload.js      # Multer file upload middleware
│   ├── routes/
│   │   ├── auth.js        # POST /api/auth/login
│   │   ├── users.js       # GET/POST /api/users
│   │   ├── bookings.js    # All booking APIs
│   │   ├── uploads.js     # POST /api/bookings/:id/upload
│   │   ├── display.js     # GET /api/display/today
│   │   ├── calendar.js    # GET /api/calendar
│   │   ├── notifications.js
│   │   └── dashboard.js
│   └── index.js           # App entry point
├── uploads/               # Uploaded files stored here
├── .env
├── .env.example
├── package.json
└── postman_collection.json
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MySQL running locally

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Key variables:
| Variable       | Description                        |
|----------------|------------------------------------|
| DB_HOST        | MySQL host (default: localhost)    |
| DB_USER        | MySQL username                     |
| DB_PASSWORD    | MySQL password                     |
| DB_NAME        | Database name (auditorium_db)      |
| JWT_SECRET     | Secret key for JWT signing         |
| SMTP_USER      | Gmail address for sending emails   |
| SMTP_PASS      | Gmail App Password                 |

### 4. Run Migration + Seed
```bash
npm run setup
```
This creates all 4 tables and inserts the 3 default users.

### 5. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```
Server runs on `http://localhost:3000`

---

## Default Seed Users

| Role      | Email                    | Password      |
|-----------|--------------------------|---------------|
| Admin     | admin@college.edu        | admin123      |
| Principal | principal@college.edu    | principal123  |
| HOD       | hod@college.edu          | hod123        |

---

## API Reference

### Auth
| Method | Endpoint           | Auth     | Description        |
|--------|--------------------|----------|--------------------|
| POST   | /api/auth/login    | None     | Login, get JWT     |

### Users
| Method | Endpoint     | Auth        | Description         |
|--------|--------------|-------------|---------------------|
| GET    | /api/users   | Admin       | Get all users       |
| POST   | /api/users   | Admin       | Create user (pass123) |

### Bookings
| Method | Endpoint                      | Auth              | Description                        |
|--------|-------------------------------|-------------------|------------------------------------|
| POST   | /api/bookings                 | HOD               | Create booking (conflict check)    |
| GET    | /api/bookings                 | Any logged-in     | Get bookings (?status= filter)     |
| GET    | /api/bookings/my              | HOD               | Get own bookings                   |
| PATCH  | /api/bookings/:id/forward     | Admin             | Forward to Principal               |
| PATCH  | /api/bookings/:id/approve     | Principal         | Approve + auto-reject conflicts    |
| PATCH  | /api/bookings/:id/reject      | Admin/Principal   | Reject booking                     |
| POST   | /api/bookings/:id/upload      | HOD               | Upload file (JPG/PNG/PDF)          |

### Other
| Method | Endpoint                      | Auth          | Description                        |
|--------|-------------------------------|---------------|------------------------------------|
| GET    | /api/display/today            | None (Public) | Today's approved events            |
| GET    | /api/calendar                 | Any logged-in | All approved + buffer times        |
| GET    | /api/notifications/my         | Any logged-in | My notifications                   |
| PATCH  | /api/notifications/:id/read   | Any logged-in | Mark notification as read          |
| GET    | /api/dashboard/stats          | Any logged-in | Booking counts by status           |

---

## Booking Rules
- Time must be between **09:00 – 17:00**
- A **30-minute buffer** is enforced before and after every approved booking
- Conflicting pending bookings are **auto-rejected** when a booking is approved
- File uploads: JPG/PNG max **5MB**, PDF max **10MB**

---

## Postman Collection
Import `postman_collection.json` into Postman.  
Set the `token` variable after login to use protected routes.

---

## Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password and use it as `SMTP_PASS` in `.env`
