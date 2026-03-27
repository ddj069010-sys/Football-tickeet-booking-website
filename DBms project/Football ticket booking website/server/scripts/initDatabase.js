require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mysql = require("mysql2");

// Try to connect and create DB/tables using the existing sorbat super-user connection
const rootConn = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "sorbat",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true
});

rootConn.connect(err => {
  if (err) { console.error("❌ Init DB Connection Failed:", err.message); process.exit(1); }
  console.log("✅ Init connection established");

  const sql = `
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
  `;

  rootConn.query(sql, (err) => {
    if (err) { console.error("❌ Schema Init Failed:", err.message); process.exit(1); }
    console.log("✅ Football_Database initialized successfully — all tables created!");
    rootConn.end();
  });
});
