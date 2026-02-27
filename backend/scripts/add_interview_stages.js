require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD), // Ensure it's a string
    database: process.env.DB_NAME,
});

async function migrate() {
    try {
        console.log('Running migration: Adding interview_stages to jobs_enhanced...');
        await pool.query('ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS interview_stages jsonb;');
        console.log('✅ Migration successful!');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        await pool.end();
        process.exit(1);
    }
}

migrate();
