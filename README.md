# SpaceSync — Resource Allocation System

A full-stack web app for the **CSE Department, Jahangirnagar University** to
book classrooms, labs and equipment, and see department-wide occupancy in
real time. Built for **CSE 362 Lab Final**.

---

## ✨ Features

- **Resource dashboard** — cards for every room / equipment with capacity and built-in facilities (projector, whiteboard, 60+ PCs, AC, etc.)
- **Booking modal** — pick date, start & end time, purpose (Class / Lab / Seminar / Meeting / Exam / Other); requester auto-fills from the logged-in user
- **Time-overlap guard** — two bookings for the same room on the same day cannot overlap; adjacent slots are allowed
- **"Right Now" live view** — see which rooms are occupied this minute (with professor name + purpose), which are starting within 30 min, and which are free; auto-refreshes every 30 s
- **Accounts with roles** — register as **Student / Teacher / Staff / Class Representative**; JWT-based auth, bcrypt password hashing
- **Reward system** — any logged-in user can hit **★ Release Early** on an occupied room when a class / meeting / lab ends before its scheduled end time. They earn **+10 reward points**, and the room instantly flips to "Free" for the whole department
- **Badges + leaderboard** — climb from 🌱 Newcomer → 🤝 Contributor (20) → 🌟 Helper (50) → 🏆 Champion (100) → 👑 Legend (250); top-10 board on the profile page
- **Schedule viewer** — filterable table of every booking with cancel
- **Light / Dark theme** — toggle in the navbar, persists in `localStorage`, follows system preference by default
- **JU Maroon + Ochre** flat editorial palette, fully responsive, keyboard-accessible modals + toasts

---

## 🧱 Tech Stack

| Layer | Stack |
|---|---|
| Backend | **Node.js**, **Express 4**, **Sequelize 6**, **mysql2**, **bcryptjs**, **jsonwebtoken** |
| Database | **MySQL 8** |
| Frontend | **React 18**, **Vite 5**, **TailwindCSS 3**, **React Router 6**, `react-hot-toast`, `axios` |
| Auth | JWT (HS256), bcrypt password hashing, per-request Bearer tokens |
| Dev | nodemon, ESLint-ready, Postman collection |

---

## 📁 Repository Layout

```
SpaceSync/
├─ backend/
│  ├─ server.js                      # entry point
│  ├─ src/
│  │  ├─ app.js                      # Express app
│  │  ├─ config/db.js                # Sequelize instance
│  │  ├─ models/                     # Resource, Booking, associations
│  │  ├─ controllers/                # bookings, resources
│  │  ├─ routes/                     # REST routes
│  │  ├─ middleware/errorHandler.js
│  │  └─ seeders/seed.js             # JU CSE resources + demo bookings
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ index.html
│  ├─ src/
│  │  ├─ main.jsx                    # boot + theme init
│  │  ├─ App.jsx                     # router
│  │  ├─ theme.js                    # light/dark manager
│  │  ├─ index.css                   # CSS variables + Tailwind
│  │  ├─ api/client.js               # fetch wrapper
│  │  ├─ components/                 # NavBar, BookingModal, ConfirmDialog
│  │  └─ pages/                      # Dashboard, Availability, Schedule
│  ├─ tailwind.config.js
│  └─ package.json
├─ docs/
│  └─ schema.sql                     # DDL reference
├─ SpaceSync.postman_collection.json
└─ README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MySQL 8+** running locally (default port 3306)
- A MySQL user with privileges to create/drop tables

### 1. Clone & install

```bash
git clone <your-repo-url> SpaceSync
cd SpaceSync

# backend deps
cd backend && npm install && cd ..

# frontend deps
cd frontend && npm install && cd ..
```

### 2. Create the database

```sql
CREATE DATABASE spacesync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure backend environment

Copy the example and set your MySQL credentials:

```bash
cd backend
cp .env.example .env    # Windows: copy .env.example .env
```

Edit `backend/.env`:

```ini
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=spacesync
DB_USER=root
DB_PASSWORD=yourpassword

CORS_ORIGIN=http://localhost:5173

# JWT — replace with a long random string in production
JWT_SECRET=spacesync-dev-secret-change-me
JWT_EXPIRES_IN=7d
```

### 4. Seed the database

Drops & recreates tables, inserts 12 resources (9 rooms + 3 equipment), 4
demo bookings anchored around the current hour, and 4 demo user accounts (one
per role) so **Right Now** has live data on first launch.

```bash
cd backend
npm run seed:reset
```

### 5. Run the servers

Two terminals:

```bash
# Terminal 1 — backend on :5000
cd backend
npm run dev

# Terminal 2 — frontend on :5173
cd frontend
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the Express backend, so no CORS setup is needed.

### 6. Demo accounts

All seeded users share the password **`password123`**:

| Role | Email | Starting points |
|---|---|---|
| Teacher | `teacher@ju.edu` | 30 |
| Student | `student@ju.edu` | 45 |
| Class Representative | `cr@ju.edu` | 70 |
| Staff | `staff@ju.edu` | 15 |

The login page also has one-tap buttons for each of these.

---

## 📦 NPM Scripts

### Backend (`backend/package.json`)
| Script | Purpose |
|---|---|
| `npm start` | Production start (`node server.js`) |
| `npm run dev` | Dev server with auto-reload via `nodemon` |
| `npm run seed` | Insert seed resources (keeps existing rows) |
| `npm run seed:reset` | **Drop & recreate all tables**, seed resources + 4 demo bookings |

### Frontend (`frontend/package.json`)
| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server on :5173 with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## 🛠 REST API

Base URL: `http://localhost:5000/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Liveness + DB check |
| `POST` | `/auth/register` | — | Create an account (role-validated) |
| `POST` | `/auth/login` | — | Returns `{ token, user }` |
| `GET` | `/auth/me` | **Bearer** | Current user + `{ reports, rank }` |
| `GET` | `/auth/leaderboard` | — | Top-10 users by `reward_points` |
| `GET` | `/resources` | — | List all resources |
| `POST` | `/resources` | — | Create a resource |
| `GET` | `/bookings` | — | List all bookings (nested `resource` + `early_release`) |
| `POST` | `/bookings` | — | Create a booking (validates overlap) |
| `POST` | `/bookings/:id/release` | **Bearer** | Report the room freed early; awards +10 pts |
| `DELETE` | `/bookings/:id` | — | Cancel a booking |

Pass JWT as `Authorization: Bearer <token>` for the marked routes.

### Example — Create booking

```http
POST /api/bookings
Content-Type: application/json

{
  "resource_id": 1,
  "requested_by": "Dr. Nasima Akter",
  "booking_date": "2026-06-01",
  "start_time": "09:00",
  "end_time": "10:30",
  "purpose": "Class"
}
```

**Success `201`** returns the booking with nested `resource`.

**Failure `400`** examples:
- `"end_time must be after start_time"`
- `"purpose must be one of: Class, Lab, Seminar, Meeting, Exam, Other"`
- `"\"Classroom 101\" is already booked on 2026-06-01 from 09:00–10:30. Please pick a different time or resource."`

A complete **Postman collection** is in the repo root:
`SpaceSync.postman_collection.json`.

---

## 🗄 Database Schema

See [`docs/schema.sql`](docs/schema.sql) for the DDL. Summary:

**`resources`**
| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK AUTO_INCREMENT | |
| `name` | VARCHAR(120) NOT NULL UNIQUE | |
| `type` | ENUM('Room','Equipment') | |
| `capacity` | INT UNSIGNED NOT NULL | |
| `facilities` | VARCHAR(255) | comma-separated, e.g. `"Projector, Whiteboard, 60+ PCs, AC"` |
| `created_at`, `updated_at` | DATETIME | |

**`bookings`**
| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK AUTO_INCREMENT | |
| `resource_id` | INT UNSIGNED FK → `resources(id)` ON DELETE CASCADE | |
| `requested_by` | VARCHAR(120) NOT NULL | |
| `booking_date` | DATE NOT NULL | |
| `start_time` | TIME NOT NULL | |
| `end_time` | TIME NOT NULL | |
| `purpose` | ENUM('Class','Lab','Seminar','Meeting','Exam','Other') | |
| `status` | VARCHAR(30) DEFAULT 'Confirmed' | |
| `created_at`, `updated_at` | DATETIME | |
| Index | `(resource_id, booking_date)` | accelerates overlap lookup |

**`users`**
| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK AUTO_INCREMENT | |
| `name` | VARCHAR(120) NOT NULL | |
| `email` | VARCHAR(160) NOT NULL UNIQUE | |
| `password_hash` | VARCHAR(255) NOT NULL | bcrypt, 10 rounds |
| `role` | ENUM('Student','Teacher','Staff','ClassRep') | |
| `department` | VARCHAR(80) DEFAULT 'CSE' | |
| `identifier` | VARCHAR(60) NULL | Student ID / Employee ID |
| `reward_points` | INT UNSIGNED DEFAULT 0 | |

**`early_releases`**
| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK AUTO_INCREMENT | |
| `booking_id` | INT UNSIGNED FK → `bookings(id)` UNIQUE ON DELETE CASCADE | one release per booking |
| `reporter_id` | INT UNSIGNED FK → `users(id)` ON DELETE CASCADE | |
| `released_at` | TIME NOT NULL | wall-clock time of release |
| `note` | VARCHAR(200) NULL | |
| `points_awarded` | INT UNSIGNED DEFAULT 10 | |

**Overlap rule.** In `backend/src/controllers/bookings.controller.js` a new booking is rejected if any existing booking for the same `(resource_id, booking_date)` satisfies:

```
existing.start_time < new.end_time  AND  existing.end_time > new.start_time
```

That is, ranges `[a, b)` and `[c, d)` overlap iff `a < d` and `c < b`. Back-to-back slots like `09:00–10:30` and `10:30–12:00` are allowed.

**Release-early flow.** `POST /bookings/:id/release` runs inside a Sequelize transaction:
1. Validate booking is today and currently ongoing (`start_time ≤ now < end_time`).
2. Reject if an `EarlyRelease` row already exists for this booking (409).
3. Insert `EarlyRelease` with `released_at = now`.
4. `UPDATE users SET reward_points = reward_points + 10 WHERE id = reporter_id`.

The frontend Availability page treats any booking with an `early_release` as having ended at `released_at`, so the room immediately moves from "Occupied" to "Free" for all viewers.

---

## 🌓 Theming

- **CSS variables** in `frontend/src/index.css` drive all colors.
- The `<html>` element carries `data-theme="light" | "dark"`.
- `frontend/src/theme.js` reads `localStorage` and applies the theme before React mounts, preventing flash-of-wrong-theme.
- To swap the palette (e.g. switch to teal or navy), edit only the `:root` and `[data-theme="dark"]` token blocks in `index.css`.

---

## 🧑‍🤝‍🧑 Team Roles & Branches

| Role | Branch | Responsibility |
|---|---|---|
| Team Lead | `team-lead` / `main` | Repo, merges, demo |
| Backend Lead | `backend-lead` | Express app, models, controllers |
| Database & Integration | `db-integration` | MySQL schema, seed, Sequelize wiring, Postman |
| Frontend Lead | `frontend-lead` | React app, routing, API client, pages |
| UI/UX + Testing | `uiux-testing` | Styling, accessibility, theming, manual QA |

All feature branches were merged into `main` for this submission; see `git log --graph --oneline` for history.

---

## 📸 Screenshots

Add these before submission (capture from http://localhost:5173):

1. Dashboard — light mode
2. Dashboard — dark mode
3. Booking modal with purpose + time pickers
4. "Right Now" page showing occupied / upcoming / free
5. Schedule table
6. Mobile responsive view
7. MySQL Workbench schema diagram

Suggested folder: `docs/screenshots/`.

---

## 📄 License

Academic project — CSE 362, Jahangirnagar University. No warranty.
