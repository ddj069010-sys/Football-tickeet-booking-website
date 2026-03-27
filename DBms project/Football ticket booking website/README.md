# GoalBooker — Football Ticket Booking Platform

A clean, full-stack football ticket booking system built with **React + Vite** (frontend) and **Node.js + Express + MySQL** (backend).

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend  | Node.js, Express.js, MySQL2      |
| Database | MySQL 8.x                        |
| Auth     | JWT + bcrypt                      |

## Project Structure

```
├── .env                  # Environment variables
├── server/               # Express backend (MVC)
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── controllers/      # authController, teamController, stadiumController, matchController, ticketController, seatController
│   ├── routes/            # authRoutes, teamRoutes, stadiumRoutes, matchRoutes, ticketRoutes, seatRoutes
│   ├── scripts/
│   │   └── initFootballDB.js # Auto-initialization script for zero-config DB setup
│   └── server.js
└── client/               # React frontend (Vite)
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/    # Navbar, ProtectedRoute, AdminRoute
        └── pages/         # Home, Login, Register, Dashboards, Matches, BookTicket, ManageMatches, ManageTeams
```

## Setup

### 1. Database
You NO LONGER need to manually import any `.sql` files. Ensure you have a running MySQL instance and update your `.env` file with accurate credentials. The backend will automatically create the `football` database, generate tables, and seed the default Super Admin user when started.

### 2. Backend
```bash
cd server
npm install
npm run dev
```
Server runs on `http://localhost:5050`

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
App runs on `http://localhost:5173`

## Default Admin Login

| Email | Password |
|-------|----------|
| admin@goalbooker.com | admin123 |

## Roles

- **User**: Browse matches, book tickets, view bookings
- **Admin**: Manage teams, manage matches, view all bookings
