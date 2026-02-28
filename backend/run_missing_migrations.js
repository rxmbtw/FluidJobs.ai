const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function runMissingMigrations() {
    const dir = path.join(__dirname, '../database/migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    try {
        const res = await pool.query('SELECT name FROM migrations');
        const executed = new Set(res.rows.map(r => r.name));

        for (const file of files) {
            if (!executed.has(file)) {
                console.log(`Executing missing migration: ${file}...`);
                const filePath = path.join(dir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                try {
                    await pool.query('BEGIN');
                    await pool.query(sql);
                    await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                    await pool.query('COMMIT');
                    console.log(`✅ Applied ${file}`);
                } catch (err) {
                    await pool.query('ROLLBACK');
                    console.error(`❌ Error executing ${file}:`, err.message);
                    // Don't stop entirely, some might fail due to preexisting elements lacking IF NOT EXISTS, 
                    // but we want to log it and continue to the next
                }
            }
        }
    } catch (e) {
        console.error('Fatal Migration Error:', e);
    } finally {
        pool.end();
    }
}

runMissingMigrations();
