const pool = require('./config/database');

async function getColumns(tableName) {
    const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1
  `, [tableName]);
    console.log(`\n--- ${tableName} ---`);
    res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
}

async function run() {
    await getColumns('candidates');
    await getColumns('job_applications');
    process.exit(0);
}
run();
