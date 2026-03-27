CREATE DATABASE IF NOT EXISTS Football_Database;
USE Football_Database;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    team1 VARCHAR(100),
    team2 VARCHAR(100),
    stadium VARCHAR(100),
    match_date DATETIME,
    price INT
);

CREATE TABLE IF NOT EXISTS tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    match_id INT,
    seat_no VARCHAR(20),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

INSERT IGNORE INTO users (user_id, name, email, password) VALUES
(1, 'Rahul', 'rahul@gmail.com', '123'),
(2, 'Priya', 'priya@gmail.com', '123');

INSERT IGNORE INTO matches (match_id, team1, team2, stadium, match_date, price) VALUES
(1, 'Barcelona', 'Real Madrid', 'Camp Nou', '2026-04-01 18:00:00', 500),
(2, 'ManU', 'Chelsea', 'Old Trafford', '2026-04-05 20:00:00', 400);
