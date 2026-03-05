const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function check() {
    const dir = path.join(__dirname, '../database/migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    try {
        const res = await pool.query('SELECT name FROM migrations');
        const executed = new Set(res.rows.map(r => r.name));
        console.log('--- Missing Migrations ---');
        let missingCount = 0;
        for (const f of files) {
            if (!executed.has(f)) {
                console.log(f);
                missingCount++;
            }
        }
        if (missingCount === 0) console.log('None! All migrations are applied.');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
