const d = require('dotenv');
d.config();
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
});

async function migrate() {
    try {
        await pool.query(`
      ALTER TABLE jobs_enhanced
        ADD COLUMN IF NOT EXISTS team_assignments JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS primary_recruiter_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);
        console.log('Migration complete: added team_assignments and primary_recruiter_id to jobs_enhanced');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
