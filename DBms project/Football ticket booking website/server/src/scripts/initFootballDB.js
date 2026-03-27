const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });

async function initFootballDB() {
  console.log('🔄 Initializing Database Connection...');

  // Connect WITHOUT database selected first to create it
  const poolAuth = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log("📦 Creating `football` database if it doesn't exist...");
    await poolAuth.query('CREATE DATABASE IF NOT EXISTS football');

    // Switch to database
    console.log('📂 Switching to `football` database...');
    await poolAuth.query('USE football');

    console.log('🔨 Creating tables...');

    // 1. USERS
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user','admin') NOT NULL DEFAULT 'user',
        membership_type ENUM('regular','vip','vvip') NOT NULL DEFAULT 'regular',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. TEAMS
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(100) NOT NULL,
        coach_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. STADIUMS
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS stadiums (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        location VARCHAR(200) NOT NULL,
        total_rows INT NOT NULL DEFAULT 10,
        seats_per_row INT NOT NULL DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. MATCHES
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        home_team_id INT NOT NULL,
        away_team_id INT NOT NULL,
        stadium_id INT NOT NULL,
        match_date DATETIME NOT NULL,
        base_ticket_price DECIMAL(10,2) NOT NULL DEFAULT 50.00,
        total_seats INT NOT NULL DEFAULT 0,
        available_seats INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_match_home_team FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_match_away_team FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_match_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // 5. SEATS
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        match_id INT NOT NULL,
        \`row_number\` INT NOT NULL,
        seat_number INT NOT NULL,
        seat_type ENUM('regular','vip','vvip') NOT NULL DEFAULT 'regular',
        is_booked BOOLEAN NOT NULL DEFAULT FALSE,
        CONSTRAINT fk_seat_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        UNIQUE KEY uq_match_seat (match_id, \`row_number\`, seat_number)
      )
    `);

    // 6. PAYMENTS
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        match_id INT NOT NULL,
        payment_method ENUM('card','upi','netbanking','wallet') NOT NULL,
        transaction_id VARCHAR(100) NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        payment_status ENUM('success','failed','pending') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
      )
    `);

    // 7. TICKETS
    await poolAuth.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        match_id INT NOT NULL,
        seat_id INT NOT NULL,
        payment_id INT NOT NULL,
        booking_status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_ticket_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        CONSTRAINT fk_ticket_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT,
        CONSTRAINT fk_ticket_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
        UNIQUE KEY uq_ticket_seat (seat_id)
      )
    `);

    console.log('⚡ Ensuring Base Data Exists...');

    // Admin User Checking
    const [existingAdmins] = await poolAuth.query('SELECT id FROM users WHERE email = ?', ['admin@goalbooker.com']);
    if (existingAdmins.length === 0) {
      const hashedPass = await bcrypt.hash('admin123', 10);
      await poolAuth.query(
        'INSERT INTO users (name, email, password, role, membership_type) VALUES (?, ?, ?, ?, ?)',
        ['Super Admin', 'admin@goalbooker.com', hashedPass, 'admin', 'vvip']
      );
      console.log('✅ Created default admin: admin@goalbooker.com / admin123');
    }

    console.log('✅ Database Initialization Complete!');
    return true;

  } catch (error) {
    console.error('❌ Database Initialization Failed:', error);
    throw error;
  } finally {
    poolAuth.end(); // close auth pool
  }
}

module.exports = initFootballDB;
