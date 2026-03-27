-- ============================================================
-- GoalBooker — Football Ticket Booking Platform
-- Database Schema (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS goalbooker_db;
USE goalbooker_db;

-- ============================================================
-- 1. USERS
-- Purpose: Stores all registered users including admins.
-- Role attribute differentiates user types (no inheritance).
-- ============================================================
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    email       VARCHAR(100)   NOT NULL UNIQUE,
    password    VARCHAR(255)   NOT NULL,           -- bcrypt hashed
    role        ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TEAMS
-- Purpose: Stores football teams.
-- Relationship: One team can participate in many matches.
-- ============================================================
CREATE TABLE teams (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    team_name   VARCHAR(100)   NOT NULL,
    coach_name  VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. MATCHES
-- Purpose: Stores match schedule and details.
-- Relationships:
--   • home_team_id → teams.id  (Many-to-One)
--   • away_team_id → teams.id  (Many-to-One)
-- Cardinality: Teams (1) ——→ Matches (Many)
-- ============================================================
CREATE TABLE matches (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    home_team_id    INT            NOT NULL,
    away_team_id    INT            NOT NULL,
    match_date      DATETIME       NOT NULL,
    venue           VARCHAR(200)   NOT NULL,
    total_seats     INT            NOT NULL DEFAULT 100,
    available_seats INT            NOT NULL DEFAULT 100,
    ticket_price    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_home_team FOREIGN KEY (home_team_id)
        REFERENCES teams(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_away_team FOREIGN KEY (away_team_id)
        REFERENCES teams(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- 4. TICKETS
-- Purpose: Stores booking information.
-- Relationships:
--   • user_id  → users.id   (Many-to-One)
--   • match_id → matches.id (Many-to-One)
-- Cardinality:
--   Users (1)   ——→ Tickets (Many)
--   Matches (1) ——→ Tickets (Many)
-- ============================================================
CREATE TABLE tickets (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT            NOT NULL,
    match_id      INT            NOT NULL,
    quantity      INT            NOT NULL DEFAULT 1,
    total_price   DECIMAL(10,2)  NOT NULL,
    booking_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ticket_match FOREIGN KEY (match_id)
        REFERENCES matches(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_matches_date      ON matches(match_date);
CREATE INDEX idx_tickets_user      ON tickets(user_id);
CREATE INDEX idx_tickets_match     ON tickets(match_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin123, bcrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@goalbooker.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9MKXqEp0KjWe1RJqMkCH6S3IS2', 'admin');

-- Sample teams
INSERT INTO teams (team_name, coach_name) VALUES
('Manchester United', 'Erik ten Hag'),
('Liverpool FC',     'Jurgen Klopp'),
('Arsenal FC',       'Mikel Arteta'),
('Chelsea FC',       'Mauricio Pochettino'),
('Manchester City',  'Pep Guardiola'),
('Tottenham Hotspur','Ange Postecoglou');

-- Sample matches
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, total_seats, available_seats, ticket_price) VALUES
(1, 2, '2026-03-15 15:00:00', 'Old Trafford',       60000, 60000, 75.00),
(3, 4, '2026-03-16 17:30:00', 'Emirates Stadium',    60000, 60000, 65.00),
(5, 6, '2026-03-20 20:00:00', 'Etihad Stadium',      55000, 55000, 80.00),
(2, 1, '2026-04-05 15:00:00', 'Anfield',             54000, 54000, 70.00),
(4, 3, '2026-04-10 19:45:00', 'Stamford Bridge',     41000, 41000, 60.00);
