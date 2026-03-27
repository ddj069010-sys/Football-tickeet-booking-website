const { pool } = require('../config/db');

async function initMariaDB() {
    console.log("🔄 Starting MariaDB Safe Initialization...");
    
    // Connect to server generally to create DB if it doesn't exist yet
    const mysql = require("mysql2/promise");
    const initPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Ishtiyaq'
    });

    try {
        await initPool.query("CREATE DATABASE IF NOT EXISTS Football_Database");
        await initPool.query("USE Football_Database");

        // ── USERS ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            role ENUM('admin','user') DEFAULT 'user',
            membership_type ENUM('regular','vip','vvip') DEFAULT 'regular',
            is_deleted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ── STADIUMS ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS stadiums (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            location VARCHAR(100),
            total_rows INT,
            seats_per_row INT
        )`);

        // ── MATCHES ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS matches (
            id INT AUTO_INCREMENT PRIMARY KEY,
            home_team VARCHAR(100),
            away_team VARCHAR(100),
            stadium_id INT,
            match_date DATETIME,
            base_price DECIMAL(10,2),
            FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE CASCADE
        )`);

        // We must ensure the table structure supports older legacy controllers. 
        // Adding legacy columns safely alongside strictly required ones.
        try { await initPool.query("ALTER TABLE matches ADD COLUMN home_team_id INT NOT NULL DEFAULT 1"); } catch(e){}
        try { await initPool.query("ALTER TABLE matches ADD COLUMN away_team_id INT NOT NULL DEFAULT 2"); } catch(e){}
        try { await initPool.query("ALTER TABLE matches ADD COLUMN available_seats INT DEFAULT 0"); } catch(e){}
        try { await initPool.query("ALTER TABLE matches ADD COLUMN total_seats INT DEFAULT 0"); } catch(e){}
        try { await initPool.query("ALTER TABLE matches ADD COLUMN base_ticket_price DECIMAL(10,2) DEFAULT 50.00"); } catch(e){}

        // ── SEATS ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS seats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            match_id INT,
            row_label VARCHAR(5),
            seat_number INT,
            seat_type ENUM('regular','vip','vvip') DEFAULT 'regular',
            is_booked BOOLEAN DEFAULT FALSE,
            locked_until DATETIME DEFAULT NULL,
            UNIQUE(match_id, row_label, seat_number),
            FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
        )`);
        
        try { await initPool.query("ALTER TABLE seats ADD COLUMN \`row_number\` INT DEFAULT 1"); } catch(e){}

        // ── PAYMENTS ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            match_id INT,
            payment_method VARCHAR(50),
            transaction_id VARCHAR(100) UNIQUE,
            amount DECIMAL(10,2),
            payment_status ENUM('success','failed','pending') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (match_id) REFERENCES matches(id)
        )`);

        // ── TICKETS ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            match_id INT,
            seat_id INT,
            payment_id INT,
            booking_status ENUM('confirmed','cancelled') DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (match_id) REFERENCES matches(id),
            FOREIGN KEY (seat_id) REFERENCES seats(id),
            FOREIGN KEY (payment_id) REFERENCES payments(id)
        )`);

        // ── Additional Essential Sync Tables (Audit + Notifications + Teams) ──
        await initPool.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action VARCHAR(100),
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await initPool.query(`
        CREATE TABLE IF NOT EXISTS teams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            team_name VARCHAR(100) NOT NULL,
            coach_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ── INDEXES ──
        try { await initPool.query("CREATE INDEX idx_match ON seats(match_id)"); } catch (e) {}
        try { await initPool.query("CREATE INDEX idx_user ON tickets(user_id)"); } catch (e) {}

        // ── SECTION 3: SEED DATA ──
        await initPool.query(`
            INSERT IGNORE INTO users (name, email, password, role)
            VALUES ('Admin','admin@test.com','$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9MKXqEp0KjWe1RJqMkCH6S3IS2','admin'),
                   ('User','user@test.com','$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9MKXqEp0KjWe1RJqMkCH6S3IS2','user')
        `);

        await initPool.query(`
            INSERT IGNORE INTO stadiums (name, location, total_rows, seats_per_row)
            VALUES ('Wembley','London',5,10)
        `);

        console.log("✅ MariaDB Schema Initialized and Seeded Safely");

    } catch (err) {
        console.error("❌ MariaDB Init Error:", err);
    } finally {
        await initPool.end();
    }
}

module.exports = initMariaDB;
