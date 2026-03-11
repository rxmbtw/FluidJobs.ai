const pool = require('./config/database');
const fs = require('fs');

async function getColumns(tableName) {
    const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1
  `, [tableName]);
    return res.rows;
}

async function run() {
    const candidates = await getColumns('candidates');
    const jobApps = await getColumns('job_applications');
    fs.writeFileSync('schema.json', JSON.stringify({ candidates, jobApps }, null, 2));
    process.exit(0);
}
run();
