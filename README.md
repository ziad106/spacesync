# SpaceSync — Resource Allocation System
CSE 362 Web Programming II — Lab Final (19-04-2026)

## Team
- Ziad — Team Lead (Git, README, orchestration)
- Protik — Backend Lead (Express routes)
- Rakib — Frontend Lead (React + Vite UI)
- Joy — Database & Integration Specialist (Sequelize schema)
- Robin — UI/UX + Testing Lead (Postman, double-booking bonus)

## Stack
Node.js, Express, Sequelize, MySQL, React, Vite, Axios

## Setup
1. `CREATE DATABASE spacesync;` in MySQL. Update password in `backend/config/db.js`.
2. Backend: `cd backend && npm install && node server.js` → :5000
3. Frontend: `cd frontend && npm install && npm run dev` → :5173
4. Seed: import `SpaceSync.postman_collection.json`, run POST /api/resources 3×

## API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resources | List all resources |
| POST | /api/resources | Create a resource |
| GET | /api/bookings | List all bookings (eager load JOIN) |
| POST | /api/bookings | Create booking (rejects double-booking) |
| DELETE | /api/bookings/:id | Cancel a booking |

## Bonus
Double-booking prevention: POST /api/bookings returns 400 if resource already booked on that date.
