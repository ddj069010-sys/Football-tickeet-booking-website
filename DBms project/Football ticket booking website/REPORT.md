# GoalBooker — Football Ticket Booking Platform
## Complete DBMS Academic Report

---

## 1. Introduction

GoalBooker is a web-based Football Ticket Booking Platform that enables users to browse upcoming football matches, book tickets online, and manage their bookings. The platform provides an administrative interface for managing teams, scheduling matches, and monitoring ticket sales. Built with modern web technologies (React, Node.js, Express, MySQL), the system demonstrates practical application of database management concepts including entity-relationship modeling, normalization, referential integrity, and role-based access control.

---

## 2. Problem Statement

Traditional football ticket booking relies on physical counters and manual record-keeping, leading to long queues, double-bookings, data inconsistency, and poor user experience. There is a need for an efficient, digital platform that:

- Eliminates manual booking errors
- Provides real-time seat availability
- Allows secure, role-based access for users and administrators
- Maintains data integrity through a well-designed relational database

---

## 3. System Objectives

1. Allow users to register, log in, browse matches, and book tickets.
2. Allow administrators to manage teams, create/edit matches, and view all bookings.
3. Maintain accurate seat availability through atomic database transactions.
4. Enforce data integrity via foreign key constraints and normalization.
5. Secure the platform using JWT authentication and bcrypt password hashing.
6. Provide a clean, modern, and responsive user interface.

---

## 4. Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Users can register with name, email, and password. |
| FR-2 | Users can log in and receive a JWT token. |
| FR-3 | Users can browse all upcoming matches with team names, dates, and prices. |
| FR-4 | Users can book tickets for a match (selecting quantity). |
| FR-5 | Users can view their booking history. |
| FR-6 | Admins can create, update, and delete teams. |
| FR-7 | Admins can create, update, and delete matches. |
| FR-8 | Admins can view all ticket bookings across all users. |
| FR-9 | Available seats decrement atomically upon booking. |
| FR-10 | System prevents booking when no seats are available. |

---

## 5. Non-Functional Requirements

| ID    | Requirement |
|-------|-------------|
| NFR-1 | Passwords must be hashed (bcrypt, 10 salt rounds). |
| NFR-2 | API must use JWT tokens for authentication. |
| NFR-3 | Frontend must be responsive (mobile + desktop). |
| NFR-4 | Database must enforce referential integrity via foreign keys. |
| NFR-5 | System must handle concurrent bookings without race conditions (via `SELECT ... FOR UPDATE`). |
| NFR-6 | Average API response time should be under 500ms. |

---

## 6. ER Diagram Explanation (Textual)

The system has **four entities** connected by **three relationships**:

```
┌──────────┐          ┌──────────┐
│          │          │          │
│  USERS   │──── 1:M ────│ TICKETS  │
│          │          │          │
└──────────┘          └────┬─────┘
                           │
                         M:1
                           │
┌──────────┐          ┌────┴─────┐
│          │── 1:M ───│          │
│  TEAMS   │          │ MATCHES  │
│          │── 1:M ───│          │
└──────────┘          └──────────┘
```

**Relationships:**

```
Users  ——<  Tickets  >——  Matches
Teams  ——<  Matches (as home_team)
Teams  ——<  Matches (as away_team)
```

- **Users → Tickets**: One user can book many tickets (1:M). A ticket must belong to exactly one user.
- **Matches → Tickets**: One match can have many ticket bookings (1:M). A ticket must reference exactly one match.
- **Teams → Matches**: One team can participate in many matches (1:M). Each match has exactly two teams (home and away), creating two foreign key references to the Teams entity.

**Participation Constraints:**
- Every ticket MUST have a user (total participation from Tickets to Users).
- Every ticket MUST reference a match (total participation from Tickets to Matches).
- Every match MUST have a home team and away team (total participation from Matches to Teams).
- A user may have zero tickets (partial participation from Users to Tickets).
- A team may have zero matches (partial participation from Teams to Matches).

---

## 7. Entity Descriptions

### ENTITY 1: USERS

| Attribute  | Data Type     | Constraints           | Description |
|------------|---------------|----------------------|-------------|
| id         | INT           | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name       | VARCHAR(100)  | NOT NULL             | Full name of user |
| email      | VARCHAR(100)  | NOT NULL, UNIQUE     | Email for login (unique) |
| password   | VARCHAR(255)  | NOT NULL             | Bcrypt hashed password |
| role       | ENUM('user','admin') | NOT NULL, DEFAULT 'user' | Role for access control |
| created_at | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

**Justification:** A single table handles both users and admins via the `role` attribute. This avoids unnecessary table inheritance and keeps the schema simple while supporting role-based access control.

### ENTITY 2: TEAMS

| Attribute  | Data Type     | Constraints           | Description |
|------------|---------------|----------------------|-------------|
| id         | INT           | PRIMARY KEY, AUTO_INCREMENT | Unique team identifier |
| team_name  | VARCHAR(100)  | NOT NULL             | Name of the football team |
| coach_name | VARCHAR(100)  | NULLABLE             | Name of the team coach |
| created_at | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### ENTITY 3: MATCHES

| Attribute       | Data Type     | Constraints           | Description |
|-----------------|---------------|----------------------|-------------|
| id              | INT           | PRIMARY KEY, AUTO_INCREMENT | Unique match identifier |
| home_team_id    | INT           | NOT NULL, FK → teams.id | Home team reference |
| away_team_id    | INT           | NOT NULL, FK → teams.id | Away team reference |
| match_date      | DATETIME      | NOT NULL             | Scheduled date and time |
| venue           | VARCHAR(200)  | NOT NULL             | Stadium/venue name |
| total_seats     | INT           | NOT NULL, DEFAULT 100 | Total seats available |
| available_seats | INT           | NOT NULL, DEFAULT 100 | Currently available seats |
| ticket_price    | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Price per ticket |
| created_at      | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**FK Constraints:**
- `home_team_id` → `teams(id)` with `ON DELETE RESTRICT, ON UPDATE CASCADE`
- `away_team_id` → `teams(id)` with `ON DELETE RESTRICT, ON UPDATE CASCADE`

`ON DELETE RESTRICT` prevents deleting a team that has scheduled matches, maintaining referential integrity.

### ENTITY 4: TICKETS

| Attribute    | Data Type     | Constraints           | Description |
|--------------|---------------|----------------------|-------------|
| id           | INT           | PRIMARY KEY, AUTO_INCREMENT | Unique ticket/booking ID |
| user_id      | INT           | NOT NULL, FK → users.id | Booking user reference |
| match_id     | INT           | NOT NULL, FK → matches.id | Booked match reference |
| quantity     | INT           | NOT NULL, DEFAULT 1  | Number of tickets booked |
| total_price  | DECIMAL(10,2) | NOT NULL             | quantity × ticket_price |
| booking_date | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | When the booking was made |

**FK Constraints:**
- `user_id` → `users(id)` with `ON DELETE CASCADE, ON UPDATE CASCADE`
- `match_id` → `matches(id)` with `ON DELETE CASCADE, ON UPDATE CASCADE`

`ON DELETE CASCADE` means if a user or match is deleted, associated ticket records are automatically removed.

---

## 8. Relational Schema

```
USERS (id, name, email, password, role, created_at)
  PK: id
  UNIQUE: email

TEAMS (id, team_name, coach_name, created_at)
  PK: id

MATCHES (id, home_team_id, away_team_id, match_date, venue, total_seats, available_seats, ticket_price, created_at)
  PK: id
  FK: home_team_id → TEAMS(id)
  FK: away_team_id → TEAMS(id)

TICKETS (id, user_id, match_id, quantity, total_price, booking_date)
  PK: id
  FK: user_id → USERS(id)
  FK: match_id → MATCHES(id)
```

---

## 9. Normalization

### First Normal Form (1NF) ✅
All attributes contain **atomic (indivisible) values**. There are no repeating groups or multi-valued attributes. Each cell holds a single value (e.g., `team_name` is a single string, not a list).

### Second Normal Form (2NF) ✅
All tables have a **single-column primary key** (`id`), so there can be no partial dependencies. Every non-key attribute is fully functionally dependent on the entire primary key.

### Third Normal Form (3NF) ✅
There are **no transitive dependencies**:
- In `USERS`: name, email, password, role all depend directly on `id`, not on each other.
- In `MATCHES`: venue, match_date, ticket_price all depend directly on the match `id`, not on home_team_id or away_team_id.
- In `TICKETS`: total_price depends on `id` (it is calculated at booking time and stored). It does NOT transitively depend through match_id, because it captures the price *at the time of booking*.
- Team details (team_name, coach_name) are stored in a **separate TEAMS table**, not repeated in MATCHES. This prevents update anomalies.

### Why Separating Tables Prevents Anomalies

| Anomaly | Without Normalization | With Normalization |
|---------|----------------------|-------------------|
| **Insertion** | Cannot add a team without creating a match | Teams table allows independent team creation |
| **Update** | Changing a team name requires updating every match row | Change team name once in `teams` table |
| **Deletion** | Deleting the last match loses team information | Team data persists independently in `teams` table |

---

## 10. Codd's Rules Explanation

Edgar F. Codd defined 12 rules (plus Rule 0) for a Relational Database Management System. Here is how GoalBooker's design aligns:

| Rule # | Rule Name | Compliance |
|--------|-----------|------------|
| 0 | Foundation Rule | MySQL is a relational DBMS. All data is managed through relational capabilities. |
| 1 | Information Rule | All data is stored in tables (users, teams, matches, tickets) as rows and columns. |
| 2 | Guaranteed Access | Every value is accessible via table name + primary key + column name. e.g., `SELECT email FROM users WHERE id = 1`. |
| 3 | Systematic Treatment of NULL | NULL is used for optional fields (e.g., `coach_name`). It is distinct from empty string or zero. |
| 4 | Active Online Catalog | MySQL stores metadata in `information_schema` — table definitions, constraints, etc. are queryable. |
| 5 | Comprehensive Data Sublanguage | SQL is used for all data definition (CREATE TABLE), manipulation (INSERT, UPDATE, DELETE), and control (GRANT). |
| 6 | View Updating Rule | Views can be created on the schema (e.g., a view joining matches with team names). Simple views are updatable. |
| 7 | High-Level Insert, Update, Delete | SQL supports set-based operations — `INSERT INTO ... SELECT`, `UPDATE ... WHERE`, `DELETE FROM ... WHERE`. |
| 8 | Physical Data Independence | Application code uses SQL queries; it does not depend on how MySQL stores data on disk. Index changes don't affect application logic. |
| 9 | Logical Data Independence | Adding a new column to a table does not break existing queries that don't reference it. |
| 10 | Integrity Independence | Integrity constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE) are defined in the schema, not in application code. |
| 11 | Distribution Independence | The application connects to MySQL via a connection string. If the database moves to a remote server, only the connection config changes. |
| 12 | Nonsubversion Rule | All data access goes through SQL. There is no bypass mechanism that circumvents integrity constraints. |

---

## 11. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  React 18 + Vite + React Router + Axios                 │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐  │
│  │  Home   │ │  Auth    │ │  Matches   │ │  Admin   │  │
│  │  Page   │ │  Pages   │ │  + Booking │ │  Pages   │  │
│  └─────────┘ └──────────┘ └────────────┘ └──────────┘  │
│              ↕ HTTP (Axios + JWT)                        │
├─────────────────────────────────────────────────────────┤
│                     SERVER (Node.js)                     │
│  Express.js + JWT + bcrypt                               │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────────┐  │
│  │ Routes   │→│ Middleware │→│    Controllers        │  │
│  │          │ │ (JWT,RBAC) │ │ (auth,team,match,     │  │
│  │          │ │            │ │  ticket)              │  │
│  └──────────┘ └────────────┘ └──────────┬───────────┘  │
│                                          ↕ SQL          │
├─────────────────────────────────────────────────────────┤
│                     DATABASE (MySQL)                     │
│  ┌───────┐ ┌───────┐ ┌─────────┐ ┌─────────┐          │
│  │ users │ │ teams │ │ matches │ │ tickets │          │
│  └───────┘ └───────┘ └─────────┘ └─────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Pattern: MVC (Model-View-Controller)**
- **Model**: MySQL tables + SQL queries in controllers
- **View**: React components (pages)
- **Controller**: Express route handlers (`controllers/`)

---

## 12. Module Description

### 12.1 Authentication Module
- **Purpose**: User registration, login, and profile retrieval.
- **Security**: Passwords hashed with bcrypt (10 rounds). JWT tokens issued on login with 24h expiry.
- **Files**: `authController.js`, `authRoutes.js`, `auth.js` (middleware)

### 12.2 Team Management Module
- **Purpose**: CRUD operations for football teams.
- **Access**: Read (public), Write (admin only).
- **Files**: `teamController.js`, `teamRoutes.js`

### 12.3 Match Management Module
- **Purpose**: CRUD operations for match scheduling.
- **Features**: JOIN queries return team names. Seat counts adjusted on update.
- **Access**: Read (public), Write (admin only).
- **Files**: `matchController.js`, `matchRoutes.js`

### 12.4 Ticket Booking Module
- **Purpose**: Ticket booking by users, booking history, admin overview.
- **Concurrency**: Uses `SELECT ... FOR UPDATE` to lock match rows during booking, preventing overselling.
- **Access**: Book/view own (user), View all (admin).
- **Files**: `ticketController.js`, `ticketRoutes.js`

---

## 13. API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | — | — | Register new user |
| POST | `/api/auth/login` | — | — | Login, get JWT |
| GET | `/api/auth/profile` | JWT | Any | Get logged-in user profile |
| GET | `/api/teams` | — | — | List all teams |
| GET | `/api/teams/:id` | — | — | Get a single team |
| POST | `/api/teams` | JWT | Admin | Create team |
| PUT | `/api/teams/:id` | JWT | Admin | Update team |
| DELETE | `/api/teams/:id` | JWT | Admin | Delete team |
| GET | `/api/matches` | — | — | List all matches (with team names) |
| GET | `/api/matches/:id` | — | — | Get a single match |
| POST | `/api/matches` | JWT | Admin | Create match |
| PUT | `/api/matches/:id` | JWT | Admin | Update match |
| DELETE | `/api/matches/:id` | JWT | Admin | Delete match |
| POST | `/api/tickets` | JWT | User | Book tickets |
| GET | `/api/tickets/my` | JWT | User | Get user's bookings |
| GET | `/api/tickets` | JWT | Admin | Get all bookings |

---

## 14. Security Design

### 14.1 Why JWT is Used
JSON Web Tokens (JWT) provide **stateless authentication**. After login, the server issues a signed token containing the user's ID, email, and role. The client sends this token in the `Authorization` header on every subsequent request. The server verifies the signature without needing to store session data, making the system horizontally scalable.

### 14.2 Why Password Hashing is Necessary
Passwords are hashed using **bcrypt** with 10 salt rounds before storage. This means:
- Even if the database is compromised, original passwords cannot be recovered.
- Each password has a unique salt, preventing rainbow table attacks.
- bcrypt is intentionally slow, making brute-force attacks impractical.

### 14.3 How RBAC Works
Role-Based Access Control is implemented through two middleware functions:
1. **`verifyToken`**: Decodes the JWT and attaches `req.user = { id, email, role }`.
2. **`isAdmin`**: Checks if `req.user.role === 'admin'`. Returns 403 if not.

Routes chain these middlewares: `router.post('/', verifyToken, isAdmin, createTeam)` ensures only authenticated admins can create teams.

### 14.4 Why Foreign Keys Maintain Integrity
Foreign key constraints ensure:
- A ticket cannot reference a non-existent user or match.
- A match cannot reference a non-existent team.
- `ON DELETE RESTRICT` on teams prevents accidental data loss.
- `ON DELETE CASCADE` on tickets ensures orphaned records are cleaned up.

---

## 15. Screenshots

*(Insert screenshots of each page after running the application)*

| # | Page | Description |
|---|------|-------------|
| 1 | Home Page | Landing page with hero section and feature cards |
| 2 | Login Page | User sign-in form |
| 3 | Register Page | New user registration form |
| 4 | Matches List | All upcoming matches with booking buttons |
| 5 | Book Ticket | Match details and qty selector with price summary |
| 6 | User Dashboard | User's booked tickets |
| 7 | Admin Dashboard | Stats overview (matches, teams, bookings, revenue) |
| 8 | Manage Matches | Admin CRUD table for matches |
| 9 | Manage Teams | Admin CRUD table for teams |

---

## 16. Deployment Strategy

### Development Setup
1. **Database**: Run `database.sql` in MySQL to create schema and seed data.
2. **Backend**: `cd server && npm install && npm run dev` — starts on port 5050 with nodemon.
3. **Frontend**: `cd client && npm install && npm run dev` — starts Vite dev server on port 5173.

### Production Deployment
1. **Build frontend**: `cd client && npm run build` — generates static files in `client/dist/`.
2. **Serve static files**: Configure Express to serve `client/dist/` in production.
3. **Environment**: Set `NODE_ENV=production`, use a strong `JWT_SECRET`, and configure MySQL credentials.
4. **Hosting options**: Deploy to any Node.js-compatible host (Railway, Render, Heroku, AWS EC2, or VPS).
5. **Database**: Use a managed MySQL service (PlanetScale, AWS RDS, Azure MySQL) or self-hosted MySQL.

---

*Report prepared for GoalBooker v2.0 — College-Level DBMS Project*
