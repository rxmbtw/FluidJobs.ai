const pool = require('./config/database');

async function migrate() {
    try {
        console.log('Connecting to database and altering table...');
        await pool.query('ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS education VARCHAR(255);');
        console.log('Added education to jobs_enhanced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
