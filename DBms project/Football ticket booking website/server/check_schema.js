const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function check() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'football'
        });

        const [tables] = await pool.query('SHOW TABLES');
        console.log("TABLES:", tables);

        for (let row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
            console.log(`\n--- ${tableName} ---`);
            columns.forEach(c => console.log(`${c.Field} (${c.Type})`));
        }

        process.exit(0);
    } catch (e) {
        console.error("DB Error:", e.message);
        process.exit(1);
    }
}
check();
