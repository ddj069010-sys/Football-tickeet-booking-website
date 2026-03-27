-- ⚽ GoalBooker Database Seeding Script v3 ⚽
-- This script matches the actual schema found in the database.

USE Football_Database;

-- 1. Ensure Admin exists
INSERT IGNORE INTO users (name, email, password, role, membership_type, is_active) 
VALUES ('System Admin', 'admin@gmail.com', '$2b$10$7vUpWpWvWvWvWvWvWvWvWuP', 'admin', 'vvip', 1);

-- 2. Sample Teams
INSERT IGNORE INTO teams (id, team_name, logo_url) VALUES 
(1, 'Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png'),
(2, 'FC Barcelona', 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_logo.svg/1200px-FC_Barcelona_logo.svg.png'),
(3, 'Manchester City', 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png'),
(4, 'Arsenal', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png'),
(5, 'Liverpool', 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png');

-- 3. Sample Stadiums
INSERT IGNORE INTO stadiums (id, name, location, image_url) VALUES 
(1, 'Santiago Bernabéu', 'Madrid, Spain', 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Santiago_Bernabeu_Stadium_-_East_Stand_2.jpg'),
(2, 'Spotify Camp Nou', 'Barcelona, Spain', 'https://upload.wikimedia.org/wikipedia/commons/4/43/Camp_Nou_interior.jpg'),
(3, 'Etihad Stadium', 'Manchester, UK', 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Etihad_Stadium_Manchester.jpg');

-- 4. Sample Matches
INSERT IGNORE INTO matches (id, home_team_id, away_team_id, stadium_id, match_date, base_price, available_seats, status) VALUES 
(1, 1, 2, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 50.00, 500, 'upcoming'),
(2, 3, 4, 3, DATE_ADD(NOW(), INTERVAL 5 DAY), 45.00, 400, 'upcoming'),
(3, 1, 3, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 60.00, 0, 'completed'),
(4, 5, 2, 2, DATE_ADD(NOW(), INTERVAL 12 HOUR), 55.00, 250, 'upcoming');

-- 5. Sample Seats for Match 1
INSERT IGNORE INTO seats (match_id, row_label, row_number, seat_number, seat_type, is_booked) VALUES 
(1, 'A', 1, 1, 'vvip', 1),
(1, 'A', 1, 2, 'vvip', 1),
(1, 'B', 2, 10, 'vip', 0),
(1, 'B', 2, 11, 'vip', 1),
(1, 'C', 3, 20, 'regular', 0),
(1, 'C', 3, 21, 'regular', 0);

-- 6. Sample Payments & Tickets for the Stats
-- payment_method MUST be one of: 'card','upi','netbanking','wallet'
INSERT IGNORE INTO payments (id, user_id, match_id, payment_method, transaction_id, amount, payment_status, created_at) 
VALUES (1, 1, 1, 'card', 'TXN_SEED_001', 250.00, 'success', DATE_SUB(NOW(), INTERVAL 2 HOUR));

INSERT IGNORE INTO tickets (id, user_id, match_id, seat_id, payment_id, booking_status, created_at)
VALUES (1, 1, 1, 1, 1, 'confirmed', DATE_SUB(NOW(), INTERVAL 2 HOUR));

INSERT IGNORE INTO payments (id, user_id, match_id, payment_method, transaction_id, amount, payment_status, created_at) 
VALUES (2, 1, 1, 'card', 'TXN_SEED_002', 250.00, 'success', DATE_SUB(NOW(), INTERVAL 1 HOUR));

INSERT IGNORE INTO tickets (id, user_id, match_id, seat_id, payment_id, booking_status, created_at)
VALUES (2, 1, 1, 2, 2, 'confirmed', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 7. Log some activities
-- action_details instead of description
INSERT IGNORE INTO user_activity_logs (user_id, action_type, action_details, created_at) VALUES 
(1, 'LOGIN', 'Admin logged in', NOW()),
(1, 'BOOKING', 'Seeded booking created for Match 1', NOW());
