-- ⚽ GoalBooker Advanced Database Features — DBMS Syllabus Integration ⚽
USE Football_Database;

-- 1. Triggers (Requirement: 2 Relational Query Languages)
-- Automatically generate seat records when a new match is created.
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_match_insert
AFTER INSERT ON matches
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE total INT;
    DECLARE rows_count INT;
    DECLARE seats_per_row INT;
    
    -- Get stadium layout info
    SELECT s.total_rows, s.seats_per_row INTO rows_count, seats_per_row 
    FROM stadiums s WHERE s.id = NEW.stadium_id;

    SET total = NEW.total_seats;
    
    WHILE i <= total DO
        INSERT INTO seats (match_id, row_number, seat_number, seat_type, is_booked, price_multiplier)
        VALUES (
            NEW.id, 
            FLOOR((i-1) / seats_per_row) + 1, 
            ((i-1) % seats_per_row) + 1,
            CASE 
                WHEN i <= (total * 0.1) THEN 'vvip'
                WHEN i <= (total * 0.3) THEN 'vip'
                ELSE 'regular'
            END,
            0,
            CASE 
                WHEN i <= (total * 0.1) THEN 2.5
                WHEN i <= (total * 0.3) THEN 1.5
                ELSE 1.0
            END
        );
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- 2. Stored Procedures (Requirement: 2 Relational Query Languages)
-- Atomic booking process using formal Transactions.
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_BookTicket(
    IN p_user_id INT,
    IN p_match_id INT,
    IN p_seat_id INT,
    IN p_payment_method VARCHAR(20),
    IN p_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_transaction_id VARCHAR(50);
    DECLARE v_payment_id INT;
    
    -- Transaction Management (Requirement: 4 Transaction Management)
    START TRANSACTION;
    
    -- Generate unique transaction ID
    SET v_transaction_id = CONCAT('TXN', UNIX_TIMESTAMP(), FLOOR(RAND() * 1000));
    
    -- 1. Insert Payment
    INSERT INTO payments (user_id, match_id, payment_method, transaction_id, amount, payment_status)
    VALUES (p_user_id, p_match_id, p_payment_method, v_transaction_id, p_amount, 'success');
    
    SET v_payment_id = LAST_INSERT_ID();
    
    -- 2. Insert Ticket
    INSERT INTO tickets (user_id, match_id, seat_id, payment_id, booking_status)
    VALUES (p_user_id, p_match_id, p_seat_id, v_payment_id, 'confirmed');
    
    -- 3. Mark Seat as Booked
    UPDATE seats SET is_booked = 1 WHERE id = p_seat_id;
    
    -- 4. Update Match Available Seats
    UPDATE matches SET available_seats = available_seats - 1 
    WHERE id = p_match_id AND available_seats > 0;
    
    COMMIT;
    
    -- Return success and transaction ID
    SELECT TRUE AS success, v_transaction_id AS transaction_id;
END //
DELIMITER ;

-- 3. Views (Requirement: 1 Introduction to DBMS)
-- Simple abstraction for upcoming matches with details.
CREATE OR REPLACE VIEW v_AvailableMatches AS
SELECT 
    m.id, 
    m.match_date, 
    m.total_seats, 
    m.available_seats, 
    m.base_price,
    t1.team_name AS home_team, 
    t2.team_name AS away_team,
    s.name AS stadium_name
FROM matches m
JOIN teams t1 ON m.home_team_id = t1.id
JOIN teams t2 ON m.away_team_id = t2.id
JOIN stadiums s ON m.stadium_id = s.id
WHERE m.match_date >= NOW() AND m.available_seats > 0;

-- 4. Indices (Requirement: 5 Storage and File Systems)
-- Performance optimization for common query paths.
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_seats_match ON seats(match_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_txn ON payments(transaction_id);
