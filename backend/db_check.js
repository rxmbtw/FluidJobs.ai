const pool = require('./config/database');
async function run() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = res.rows.map(r => r.table_name).sort();
        console.log(`-- ${tables.length} Total Tables --`);
        console.log(tables.join(', '));
    } catch (e) { console.error(e); }
    pool.end();
}
run();
