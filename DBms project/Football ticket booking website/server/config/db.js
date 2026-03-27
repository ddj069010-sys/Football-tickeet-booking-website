require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mysql = require("mysql2");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Football_Database",
  multipleStatements: true
};

console.log(`🔌 Attempting DB connection: ${dbConfig.user}@${dbConfig.host} (DB: ${dbConfig.database})`);

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error("❌ DB Connection Failed:");
    console.error(err); // Log full error object
    console.error("👉 Check server/.env — ensure DB_HOST, DB_NAME, DB_USER and DB_PASSWORD are correct.");
    return;
  }
  console.log("✅ Connected to MariaDB — database:", dbConfig.database);

  const fs = require('fs');
  const path = require('path');
  
  // Adjusted to point to Football.session.sql in repo root (2 levels up from server/config)
  const sqlFilePath = path.join(__dirname, '../../Football.session.sql');
  
  if (fs.existsSync(sqlFilePath)) {
    try {
      const initSQL = fs.readFileSync(sqlFilePath, 'utf8').trim();
      if (initSQL) {
        db.query(initSQL, (err) => {
          if (err) {
            console.error("❌ Table Init from SQL file Failed:", err.sqlMessage || err.message);
          } else {
            console.log("✅ Tables ready — database schema synced from Football.session.sql");
          }
        });
      } else {
        console.log("ℹ️  Note: Football.session.sql is empty. Skipping auto-init.");
      }

    } catch(error) {
      console.error("❌ Failed to read or execute SQL session file:", error.message);
    }
  } else {
    console.warn("⚠️  Note: Football.session.sql not found at project root. Skipping auto-init.");
  }
});

db.on('error', (err) => {
  console.error("DB runtime error:", err);
  if (err.fatal) {
    console.error("Fatal DB error — connection lost. Please restart the server.");
  }
});

module.exports = db;
