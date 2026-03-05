const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function applyMigration() {
    const filePath = path.join(__dirname, '../database/migrations/023_fix_superadmin_fkeys.sql');
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
        console.log('Connected to the database. Running migration 23...');
        await pool.query(sql);
        console.log('Migration 23 applied successfully.');
    } catch (error) {
        console.error('Error applying migration 23:', error);
    } finally {
        pool.end();
    }
}

applyMigration();
