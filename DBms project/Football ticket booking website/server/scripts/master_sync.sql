-- ⚽ GoalBooker Master Synchronization Script — DBMS Syllabus Integrated ⚽
-- This script ensures perfect sync of all tables, relationships, and advanced features.

DROP DATABASE IF EXISTS Football_Database;
CREATE DATABASE Football_Database;
USE Football_Database;

-- 1. Users Table (Intro topics: Entities, Attributes)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    membership_type ENUM('regular', 'vip', 'vvip') DEFAULT 'regular',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teams Table
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Stadiums Table
CREATE TABLE stadiums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    total_rows INT DEFAULT 10,
    seats_per_row INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Matches Table (Relational Integrity: Foreign Keys)
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    stadium_id INT NOT NULL,
    match_date DATETIME NOT NULL,
    base_price DECIMAL(10, 2) DEFAULT 50.00,
    available_seats INT DEFAULT 0,
    total_seats INT DEFAULT 0,
    status ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    banner_url VARCHAR(500),
    FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE CASCADE
);

-- 5. Seats Table (Storage topic: Indices)
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    row_number INT NOT NULL,
    seat_number INT NOT NULL,
    seat_type ENUM('regular', 'vip', 'vvip') DEFAULT 'regular',
    is_booked TINYINT(1) DEFAULT 0,
    price_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- 6. Payments Table (Transaction Management topic: ACID)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- 7. Tickets Table
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    seat_id INT NOT NULL,
    payment_id INT NOT NULL,
    booking_status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 8. User Activity Logs
CREATE TABLE user_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXING (Requirement: 5 Storage and File Systems)
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_seats_match ON seats(match_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_payments_txn ON payments(transaction_id);

-- TRIGGERS (Requirement: 2 Relational Query Languages)
DELIMITER //
CREATE TRIGGER after_match_insert
AFTER INSERT ON matches
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE seats_count INT;
    DECLARE row_size INT;
    
    SELECT s.seats_per_row INTO row_size FROM stadiums s WHERE s.id = NEW.stadium_id;
    SET seats_count = NEW.total_seats;
    
    WHILE i <= seats_count DO
        INSERT INTO seats (match_id, row_number, seat_number, seat_type, is_booked, price_multiplier)
        VALUES (
            NEW.id, 
            FLOOR((i-1) / row_size) + 1, 
            ((i-1) % row_size) + 1,
            CASE 
                WHEN i <= (seats_count * 0.1) THEN 'vvip'
                WHEN i <= (seats_count * 0.3) THEN 'vip'
                ELSE 'regular'
            END,
            0,
            CASE 
                WHEN i <= (seats_count * 0.1) THEN 2.5
                WHEN i <= (seats_count * 0.3) THEN 1.5
                ELSE 1.0
            END
        );
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- STORED PROCEDURE (Requirement: 2 Relational Query Languages)
DELIMITER //
CREATE PROCEDURE sp_BookTicket(
    IN p_user_id INT,
    IN p_match_id INT,
    IN p_seat_id INT,
    IN p_payment_method VARCHAR(20),
    IN p_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_transaction_id VARCHAR(50);
    DECLARE v_payment_id INT;
    
    START TRANSACTION;
    
    SET v_transaction_id = CONCAT('TXN', UNIX_TIMESTAMP(), FLOOR(RAND() * 1000));
    
    INSERT INTO payments (user_id, match_id, payment_method, transaction_id, amount, payment_status)
    VALUES (p_user_id, p_match_id, p_payment_method, v_transaction_id, p_amount, 'success');
    
    SET v_payment_id = LAST_INSERT_ID();
    
    INSERT INTO tickets (user_id, match_id, seat_id, payment_id, booking_status)
    VALUES (p_user_id, p_match_id, p_seat_id, v_payment_id, 'confirmed');
    
    UPDATE seats SET is_booked = 1 WHERE id = p_seat_id;
    UPDATE matches SET available_seats = available_seats - 1 WHERE id = p_match_id AND available_seats > 0;
    
    COMMIT;
    
    SELECT TRUE AS success, v_transaction_id AS transaction_id;
END //
DELIMITER ;

-- VIEW (Requirement: 1 Introduction to DBMS)
CREATE VIEW v_AvailableMatches AS
SELECT 
    m.id, m.match_date, m.total_seats, m.available_seats, m.base_price,
    t1.team_name AS home_team, t2.team_name AS away_team, s.name AS stadium_name
FROM matches m
JOIN teams t1 ON m.home_team_id = t1.id
JOIN teams t2 ON m.away_team_id = t2.id
JOIN stadiums s ON m.stadium_id = s.id
WHERE m.match_date >= NOW() AND m.available_seats > 0;

-- SEED DATA
INSERT INTO users (name, email, password, role, membership_type, is_active) 
VALUES ('System Admin', 'admin@gmail.com', '$2a$10$oQHdKA8sPVN2t95k4cZ3wOLk1ScqMORmUBe1pPsZiArM06UQ.j52.', 'admin', 'vvip', 1);

INSERT INTO teams (id, team_name, logo_url) VALUES 
(1, 'Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png'),
(2, 'FC Barcelona', 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_logo.svg/1200px-FC_Barcelona_logo.svg.png'),
(3, 'Manchester City', 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png'),
(4, 'Arsenal', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png'),
(5, 'Liverpool', 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png');

INSERT INTO stadiums (id, name, location, image_url, total_rows, seats_per_row) VALUES 
(1, 'Santiago Bernabéu', 'Madrid, Spain', 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Santiago_Bernabeu_Stadium_-_East_Stand_2.jpg', 25, 20),
(2, 'Spotify Camp Nou', 'Barcelona, Spain', 'https://upload.wikimedia.org/wikipedia/commons/4/43/Camp_Nou_interior.jpg', 30, 25),
(3, 'Etihad Stadium', 'Manchester, UK', 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Etihad_Stadium_Manchester.jpg', 20, 20);

-- Match 1 creation will trigger seat generation automatically!
INSERT INTO matches (id, home_team_id, away_team_id, stadium_id, match_date, base_price, total_seats, available_seats, status) VALUES 
(1, 1, 2, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 50.00, 500, 500, 'upcoming'),
(2, 3, 4, 3, DATE_ADD(NOW(), INTERVAL 5 DAY), 45.00, 400, 400, 'upcoming');
