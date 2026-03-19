# PulseHR — Employee Management System

A full-stack Employee Management System built with React, Express, and SQLite.
No MongoDB or separate database server required — SQLite creates a single `.db` file automatically.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Chart.js                |
| Backend  | Node.js, Express                  |
| Database | SQLite (via better-sqlite3)       |
| Fonts    | DM Sans, DM Mono, Syne (Google)   |

---

## Project Structure

```
emp-management/
├── package.json          ← root scripts (run both servers together)
├── .gitignore
├── README.md
│
├── backend/
│   ├── package.json
│   ├── .env              ← PORT and CLIENT_URL
│   ├── server.js         ← Express entry point
│   ├── database.js       ← SQLite setup + demo seed data
│   └── routes/
│       ├── employees.js  ← CRUD for employees
│       └── attendance.js ← punch in/out, logs, hours summary
│
└── frontend/
    ├── package.json
    ├── .env              ← REACT_APP_API_URL
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                  ← entry point + global styles
        ├── App.jsx                   ← sidebar layout + routing
        ├── services/
        │   └── api.js                ← all fetch calls to backend
        ├── hooks/
        │   └── index.js              ← useEmployees, useAttendanceLogs, useGeolocation, useClock
        ├── components/
        │   ├── UI.jsx                ← Toast, Modal, Button, Badge, Input, StatCard, Card…
        │   └── EmployeeForm.jsx      ← add/edit employee modal
        └── pages/
            ├── Dashboard.jsx         ← stats, live feed, roster
            ├── Employees.jsx         ← search, filter, CRUD table
            ├── CheckIn.jsx           ← geo punch card + recent logs
            ├── Attendance.jsx        ← today's view + all logs
            └── Analytics.jsx         ← Chart.js bar + doughnut + leaderboard
```

---

## Quick Start

### Option A — One command (recommended)

```bash
# 1. Install all packages
npm run setup

# 2. Start both servers together
npm run dev
```

### Option B — Two terminals

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
# → Server running on http://localhost:5000
# → Demo employees seeded automatically
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
# → Opens http://localhost:3000
```

---

## API Endpoints

### Employees
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | /api/employees        | All employees (?search= ?role= ?status=) |
| GET    | /api/employees/:id    | Single employee                      |
| POST   | /api/employees        | Create employee                      |
| PUT    | /api/employees/:id    | Update employee                      |
| DELETE | /api/employees/:id    | Remove employee                      |

### Attendance
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | /api/attendance/punch           | Check in or check out          |
| GET    | /api/attendance                 | All logs (?employeeId= ?type= ?date=) |
| GET    | /api/attendance/hours-summary   | Total hours per employee       |
| GET    | /api/attendance/today-summary   | Today's attendance counts      |
| GET    | /api/health                     | Server health check            |

---

## Features

- **Dashboard** — Live stats (present/absent/late/leave), activity feed, roster table with GPS coordinates
- **Employee Directory** — Search by name/email/ID, filter by role, add/edit/delete with validation
- **Geo Check-In** — Uses browser Geolocation API (falls back to simulated coords in demo)
- **Attendance Tracker** — Today's punch times + all-time logs with coordinates
- **Analytics** — Bar chart of hours worked, doughnut chart of attendance status, hours leaderboard

---

## Database

SQLite file is created automatically at `backend/database.db` on first run.
8 demo employees are seeded automatically if the table is empty.

To view the database visually:
- Download **DB Browser for SQLite** from https://sqlitebrowser.org
- Open `backend/database.db`

To reset the database (start fresh):
```bash
cd backend
rm database.db
npm run dev   # re-creates and re-seeds
```

---

## Environment Variables

**backend/.env**
```
PORT=5000
CLIENT_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```
