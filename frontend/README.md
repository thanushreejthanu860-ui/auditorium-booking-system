# Ratan Tata Auditorium — Booking & Event Support System (Frontend)

React.js frontend for the college auditorium booking system with role-based access for HOD, Admin, and Principal.

---

## Tech Stack

- **React 18** + React Router v6
- **Axios** — API calls with JWT interceptors
- **react-hot-toast** — Toast notifications
- **Pure CSS** — No Bootstrap, fully responsive

---

## Prerequisites

- Node.js ≥ 16
- Backend server running at `http://localhost:5000`

---

## Setup & Run

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

App runs at **http://localhost:3000**

---

## Environment Variables

Create a `.env` file in the `frontend/` directory (already included):

```
REACT_APP_API_URL=http://localhost:5000
```

---

## Roles & Pages

### All Roles
| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | Email + password login, JWT stored in localStorage |
| Dashboard | `/dashboard` | Stat cards, recent notifications, quick actions |
| Calendar | `/calendar` | Monthly calendar with approved bookings + 30-min buffer zones |

### HOD Only
| Page | Path | Description |
|------|------|-------------|
| New Booking | `/bookings/new` | Submit booking with full validation |
| My Bookings | `/bookings/my` | View all own bookings with status badges |
| LED Upload | `/bookings/:id/upload` | Upload JPG/PNG/PDF for approved bookings |

### Admin Only
| Page | Path | Description |
|------|------|-------------|
| Review Requests | `/admin/review` | Verify & forward or reject pending bookings |
| Manage Users | `/admin/users` | View all users, create new users via modal |

### Principal Only
| Page | Path | Description |
|------|------|-------------|
| Final Approvals | `/principal/approvals` | Approve or reject forwarded bookings |

### Public (No Login)
| Page | Path | Description |
|------|------|-------------|
| LED Display | `/display` | Full-screen event display, auto-refreshes every 60s |

---

## Key Features

- **JWT Auth** — Token stored in localStorage, sent as `Authorization: Bearer <token>` on every request
- **401 Handling** — Automatically redirects to `/login` on token expiry
- **Role-based routing** — Wrong-role access redirects to `/dashboard`
- **Loading spinners** — Shown during all API calls
- **Toast notifications** — Success/error feedback for all actions
- **Conflict detection** — Shows "Time slot conflict" message on 409 response
- **File validation** — JPG/PNG max 5MB, PDF max 10MB, validated before upload
- **Image preview** — Shows preview before uploading image files
- **Calendar buffer zones** — 30-min buffers shown in yellow around each event
- **Responsive** — Mobile sidebar toggle, responsive grid layouts

---

## Project Structure

```
src/
├── components/
│   ├── Layout.js          # Sidebar + Header + Notification dropdown
│   ├── ProtectedRoute.js  # Auth + role guard
│   └── Spinner.js         # Loading spinner
├── pages/
│   ├── Shared/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   └── Calendar.js
│   ├── HOD/
│   │   ├── NewBooking.js
│   │   ├── MyBookings.js
│   │   └── LEDUpload.js
│   ├── Admin/
│   │   ├── ReviewRequests.js
│   │   └── ManageUsers.js
│   ├── Principal/
│   │   └── FinalApproval.js
│   └── LEDDisplay.js      # Public LED screen
├── utils/
│   ├── api.js             # Axios instance with interceptors
│   └── auth.js            # localStorage helpers
├── styles/
│   └── global.css         # All styles
└── App.js                 # Routes
```

---

## Default Credentials (from backend seed)

| Role | Email | Password |
|------|-------|----------|
| HOD | hod@college.edu | pass123 |
| Admin | admin@college.edu | pass123 |
| Principal | principal@college.edu | pass123 |

> Check the backend `seed.js` for exact seeded credentials.
