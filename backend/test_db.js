const pool = require('./config/database');
async function check() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'superadmins'");
        console.log("superadmins columns:");
        console.log(res.rows.map(r => r.column_name).join(', '));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
