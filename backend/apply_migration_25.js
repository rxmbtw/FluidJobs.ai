require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
});

const sql = fs.readFileSync(__dirname + '/../database/migrations/025_interviewer_assignments.sql', 'utf8');

pool.query(sql).then(() => {
    console.log("Migration 025 successful");
    pool.end();
}).catch(e => {
    console.error("Migration 025 failed", e);
    pool.end();
});
